import CameraRoll from '@react-native-community/cameraroll';
import RNFS from 'react-native-fs';
import { imageOptimizer } from '../../../utils/performance/ImageOptimizer';
import { cacheManager } from '../../../utils/performance/CacheManager';
import { dataCompressor } from '../../../utils/performance/DataCompressor';

export interface Photo {
  id: string;
  uri: string;
  timestamp: number;
  deliveryId?: string;
  type: 'delivery' | 'incident' | 'pickup_ground' | 'delivery_ground';
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
  syncStatus: 'pending' | 'synced' | 'failed';
}

class PhotoService {
  private photos: Photo[] = [];
  private readonly PHOTOS_DIRECTORY = `${RNFS.DocumentDirectoryPath}/delivery-photos`;

  constructor() {
    this.initializeDirectory();
    this.loadPhotosFromCache();
  }

  private async initializeDirectory() {
    try {
      const exists = await RNFS.exists(this.PHOTOS_DIRECTORY);
      if (!exists) {
        await RNFS.mkdir(this.PHOTOS_DIRECTORY);
      }
    } catch (error) {
      console.error('Error creating photos directory:', error);
    }
  }

  private async loadPhotosFromCache() {
    try {
      const cachedPhotos = await dataCompressor.retrieveCompressed('photos_metadata');
      if (cachedPhotos) {
        this.photos = cachedPhotos;
      }
    } catch (error) {
      console.error('Error loading photos from cache:', error);
    }
  }

  private async savePhotosToCache() {
    try {
      await dataCompressor.storeCompressed('photos_metadata', this.photos);
    } catch (error) {
      console.error('Error saving photos to cache:', error);
    }
  }

  // Sauvegarder une photo avec optimisation
  async savePhoto(
    uri: string,
    type: 'delivery' | 'incident' | 'pickup_ground' | 'delivery_ground',
    deliveryId?: string,
    description?: string
  ): Promise<Photo> {
    try {
      // Optimiser l'image
      const optimizedImage = await imageOptimizer.optimizeImage(uri);
      
      // Copier dans notre répertoire
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const newPath = `${this.PHOTOS_DIRECTORY}/${fileName}`;
      await RNFS.copyFile(optimizedImage.uri, newPath);

      // Mettre en cache l'image optimisée
      await cacheManager.cacheFile(`photo_${fileName}`, newPath);

      // Créer l'entrée de photo
      const photo: Photo = {
        id: fileName,
        uri: newPath,
        timestamp: Date.now(),
        deliveryId,
        type,
        status: 'pending',
        description,
        syncStatus: 'pending',
      };

      this.photos.push(photo);
      await this.savePhotosToCache();

      return photo;
    } catch (error) {
      console.error('Error saving photo:', error);
      throw error;
    }
  }

  // Récupérer une photo avec cache
  async getPhotoUri(photoId: string): Promise<string | null> {
    const photo = this.photos.find(p => p.id === photoId);
    if (!photo) return null;

    // Vérifier le cache d'abord
    const cachedPath = await cacheManager.getCachedFile(`photo_${photoId}`);
    if (cachedPath) {
      return cachedPath;
    }

    // Si pas en cache, vérifier le fichier original
    const exists = await RNFS.exists(photo.uri);
    if (!exists) return null;

    // Mettre en cache pour la prochaine fois
    await cacheManager.cacheFile(`photo_${photoId}`, photo.uri);
    return photo.uri;
  }

  // Récupérer toutes les photos
  getPhotos(): Photo[] {
    return [...this.photos];
  }

  // Récupérer les photos par livraison
  getPhotosByDeliveryId(deliveryId: string): Photo[] {
    return this.photos.filter((photo) => photo.deliveryId === deliveryId);
  }

  // Récupérer les photos par type
  getPhotosByType(type: 'delivery' | 'incident' | 'pickup_ground' | 'delivery_ground'): Photo[] {
    return this.photos.filter((photo) => photo.type === type);
  }

  // Supprimer une photo
  async deletePhoto(id: string): Promise<void> {
    const photo = this.photos.find((p) => p.id === id);
    if (!photo) return;

    try {
      // Supprimer le fichier
      await RNFS.unlink(photo.uri);

      // Mettre à jour la liste
      this.photos = this.photos.filter((p) => p.id !== id);
      await this.savePhotosToCache();
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }

  // Marquer une photo comme synchronisée
  markPhotoAsSynced(id: string): void {
    const photo = this.photos.find((p) => p.id === id);
    if (photo) {
      photo.syncStatus = 'synced';
    }
  }

  // Marquer une photo comme échouée
  markPhotoAsFailed(id: string): void {
    const photo = this.photos.find((p) => p.id === id);
    if (photo) {
      photo.syncStatus = 'failed';
    }
  }

  // Récupérer les photos non synchronisées
  getUnsyncedPhotos(): Photo[] {
    return this.photos.filter((photo) => photo.syncStatus === 'pending');
  }

  // Vérifier si les photos requises sont présentes pour le ramassage
  hasRequiredPickupPhotos(deliveryId: string): boolean {
    const photos = this.getPhotosByDeliveryId(deliveryId);
    return photos.some(photo => 
      photo.type === 'pickup_ground' && 
      (photo.status === 'approved' || photo.status === 'pending')
    );
  }

  // Vérifier si les photos requises sont présentes pour la livraison
  hasRequiredDeliveryPhotos(deliveryId: string): boolean {
    const photos = this.getPhotosByDeliveryId(deliveryId);
    return photos.some(photo => 
      photo.type === 'delivery_ground' && 
      (photo.status === 'approved' || photo.status === 'pending')
    );
  }

  // Approuver une photo (admin uniquement)
  approvePhoto(photoId: string): void {
    const photo = this.photos.find(p => p.id === photoId);
    if (photo) {
      photo.status = 'approved';
    }
  }

  // Rejeter une photo (admin uniquement)
  rejectPhoto(photoId: string): void {
    const photo = this.photos.find(p => p.id === photoId);
    if (photo) {
      photo.status = 'rejected';
    }
  }

  // Nettoyer les photos anciennes
  async cleanupOldPhotos(maxAge: number = 30 * 24 * 60 * 60 * 1000) { // 30 jours par défaut
    const now = Date.now();
    const oldPhotos = this.photos.filter(photo => now - photo.timestamp > maxAge);

    for (const photo of oldPhotos) {
      await this.deletePhoto(photo.id);
    }
  }
}

export const photoService = new PhotoService();
