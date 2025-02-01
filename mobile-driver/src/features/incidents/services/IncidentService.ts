import { photoService } from '../../delivery-photos/services/PhotoService';
import { dataCompressor } from '../../../utils/performance/DataCompressor';
import { cacheManager } from '../../../utils/performance/CacheManager';

export type IncidentType = 
  | 'damage'           // Dommage à la marchandise
  | 'delay'            // Retard
  | 'access_problem'   // Problème d'accès
  | 'weather'          // Conditions météorologiques
  | 'vehicle_issue'    // Problème de véhicule
  | 'other';           // Autre

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'pending' | 'in_review' | 'resolved' | 'closed';

export interface Incident {
  id: string;
  deliveryId?: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: number;
  status: IncidentStatus;
  photoIds: string[];
  resolution?: string;
  resolvedAt?: number;
  resolvedBy?: string;
}

class IncidentService {
  private incidents: Incident[] = [];
  private readonly CACHE_KEY = 'incidents_data';

  constructor() {
    this.loadFromCache();
  }

  private async loadFromCache() {
    try {
      const cachedData = await dataCompressor.retrieveCompressed(this.CACHE_KEY);
      if (cachedData) {
        this.incidents = cachedData;
      }
    } catch (error) {
      console.error('Error loading incidents from cache:', error);
    }
  }

  private async saveToCache() {
    try {
      await dataCompressor.storeCompressed(this.CACHE_KEY, this.incidents);
    } catch (error) {
      console.error('Error saving incidents to cache:', error);
    }
  }

  // Créer un nouvel incident
  async createIncident(
    data: Omit<Incident, 'id' | 'timestamp' | 'status' | 'photoIds'> & { photos?: string[] }
  ): Promise<Incident> {
    const photoIds: string[] = [];

    // Sauvegarder les photos si présentes
    if (data.photos && data.photos.length > 0) {
      for (const photoUri of data.photos) {
        try {
          const photo = await photoService.savePhoto(
            photoUri,
            'incident',
            data.deliveryId,
            `Incident photo - ${data.type}`
          );
          photoIds.push(photo.id);

          // Mettre en cache la photo pour un accès rapide
          await cacheManager.cacheFile(`incident_photo_${photo.id}`, photo.uri);
        } catch (error) {
          console.error('Error saving incident photo:', error);
        }
      }
    }

    const incident: Incident = {
      id: Date.now().toString(),
      ...data,
      timestamp: Date.now(),
      status: 'pending',
      photoIds,
    };

    this.incidents.push(incident);
    await this.saveToCache();

    return incident;
  }

  // Récupérer tous les incidents
  getIncidents(): Incident[] {
    return [...this.incidents];
  }

  // Récupérer les incidents par livraison
  getIncidentsByDeliveryId(deliveryId: string): Incident[] {
    return this.incidents.filter(incident => incident.deliveryId === deliveryId);
  }

  // Récupérer un incident par ID
  getIncidentById(id: string): Incident | undefined {
    return this.incidents.find(incident => incident.id === id);
  }

  // Mettre à jour le statut d'un incident
  updateIncidentStatus(id: string, status: IncidentStatus, resolution?: string): void {
    const incident = this.incidents.find(inc => inc.id === id);
    if (incident) {
      incident.status = status;
      if (status === 'resolved' || status === 'closed') {
        incident.resolution = resolution;
        incident.resolvedAt = Date.now();
      }
    }
  }

  // Ajouter une photo à un incident
  async addPhotoToIncident(id: string, photoUri: string): Promise<void> {
    const incident = this.incidents.find(inc => inc.id === id);
    if (incident) {
      try {
        const photo = await photoService.savePhoto(
          photoUri,
          'incident',
          incident.deliveryId,
          `Additional incident photo - ${incident.type}`
        );
        incident.photoIds.push(photo.id);
      } catch (error) {
        console.error('Error adding photo to incident:', error);
        throw error;
      }
    }
  }

  // Obtenir les photos d'un incident
  async getIncidentPhotos(incidentId: string): Promise<string[]> {
    const incident = this.getIncidentById(incidentId);
    if (!incident) return [];

    const photoUris: string[] = [];
    for (const photoId of incident.photoIds) {
      // Vérifier d'abord le cache
      const cachedUri = await cacheManager.getCachedFile(`incident_photo_${photoId}`);
      if (cachedUri) {
        photoUris.push(cachedUri);
        continue;
      }

      // Si pas en cache, obtenir depuis le service photo
      const photoUri = await photoService.getPhotoUri(photoId);
      if (photoUri) {
        photoUris.push(photoUri);
        // Mettre en cache pour la prochaine fois
        await cacheManager.cacheFile(`incident_photo_${photoId}`, photoUri);
      }
    }

    return photoUris;
  }

  // Supprimer un incident
  async deleteIncident(id: string): Promise<void> {
    const incident = this.incidents.find(inc => inc.id === id);
    if (incident) {
      // Supprimer les photos associées
      for (const photoId of incident.photoIds) {
        try {
          await photoService.deletePhoto(photoId);
          // Supprimer aussi du cache
          await cacheManager.remove(`incident_photo_${photoId}`);
        } catch (error) {
          console.error('Error deleting incident photo:', error);
        }
      }

      this.incidents = this.incidents.filter(inc => inc.id !== id);
      await this.saveToCache();
    }
  }

  // Obtenir les statistiques des incidents
  getIncidentStats() {
    return {
      total: this.incidents.length,
      pending: this.incidents.filter(inc => inc.status === 'pending').length,
      resolved: this.incidents.filter(inc => inc.status === 'resolved').length,
      critical: this.incidents.filter(inc => inc.severity === 'critical').length,
    };
  }

  // Nettoyer les incidents anciens
  async cleanupOldIncidents(maxAge: number = 30 * 24 * 60 * 60 * 1000) { // 30 jours par défaut
    const now = Date.now();
    const oldIncidents = this.incidents.filter(incident => 
      incident.status === 'closed' && 
      now - incident.timestamp > maxAge
    );

    for (const incident of oldIncidents) {
      await this.deleteIncident(incident.id);
    }
  }
}

export const incidentService = new IncidentService();
