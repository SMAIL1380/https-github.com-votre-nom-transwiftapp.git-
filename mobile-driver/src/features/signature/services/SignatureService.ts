import CameraRoll from '@react-native-community/cameraroll';
import { Platform } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { imageOptimizer } from '../../../utils/performance/ImageOptimizer';
import { cacheManager } from '../../../utils/performance/CacheManager';
import { dataCompressor } from '../../../utils/performance/DataCompressor';
import * as RNFS from 'react-native-fs';

interface SignatureData {
  id: string;
  imageUri: string;
  date: Date;
  deliveryId?: string;
}

class SignatureService {
  private signatures: SignatureData[] = [];
  private readonly SIGNATURES_DIRECTORY = `${RNFS.DocumentDirectoryPath}/signatures`;

  constructor() {
    this.initializeDirectory();
    this.loadSignaturesFromCache();
  }

  private async initializeDirectory() {
    try {
      await RNFS.mkdir(this.SIGNATURES_DIRECTORY);
    } catch (error) {
      console.error('Error initializing directory:', error);
    }
  }

  private async loadSignaturesFromCache() {
    try {
      const cachedSignatures = await dataCompressor.retrieveCompressed('signatures_metadata');
      if (cachedSignatures) {
        this.signatures = cachedSignatures;
      }
    } catch (error) {
      console.error('Error loading signatures from cache:', error);
    }
  }

  private async saveSignaturesToCache() {
    try {
      await dataCompressor.storeCompressed('signatures_metadata', this.signatures);
    } catch (error) {
      console.error('Error saving signatures to cache:', error);
    }
  }

  async saveSignature(
    signature: string,
    deliveryId?: string
  ): Promise<SignatureData> {
    try {
      // Convertir les données base64 en image
      const tempPath = `${RNFS.CachesDirectoryPath}/temp_signature.png`;
      await RNFS.writeFile(tempPath, signature.replace(/^data:image\/\w+;base64,/, ''), 'base64');

      // Optimiser l'image de la signature
      const optimizedSignature = await imageOptimizer.optimizeImage(tempPath, {
        maxWidth: 800,
        maxHeight: 400,
        quality: 90,
        outputFormat: 'PNG'
      });

      // Sauvegarder la signature optimisée
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
      const newPath = `${this.SIGNATURES_DIRECTORY}/${fileName}`;
      await RNFS.copyFile(optimizedSignature.uri, newPath);

      // Mettre en cache la signature
      await cacheManager.cacheFile(`signature_${fileName}`, newPath);

      // Nettoyer le fichier temporaire
      await RNFS.unlink(tempPath);

      const signatureData: SignatureData = {
        id: fileName,
        imageUri: newPath,
        date: new Date(),
        deliveryId,
      };

      this.signatures.push(signatureData);
      await this.saveSignaturesToCache();

      return signatureData;
    } catch (error) {
      console.error('Error saving signature:', error);
      throw error;
    }
  }

  async getSignatureUri(signatureId: string): Promise<string | null> {
    const signature = this.signatures.find(s => s.id === signatureId);
    if (!signature) return null;

    // Vérifier le cache d'abord
    const cachedPath = await cacheManager.getCachedFile(`signature_${signatureId}`);
    if (cachedPath) {
      return cachedPath;
    }

    // Si pas en cache, vérifier le fichier original
    const exists = await RNFS.exists(signature.imageUri);
    if (!exists) return null;

    // Mettre en cache pour la prochaine fois
    await cacheManager.cacheFile(`signature_${signatureId}`, signature.imageUri);
    return signature.imageUri;
  }

  async getSignatures(): Promise<SignatureData[]> {
    return [...this.signatures];
  }

  async getSignatureById(id: string): Promise<SignatureData | undefined> {
    return this.signatures.find((sig) => sig.id === id);
  }

  async getSignaturesByDeliveryId(deliveryId: string): Promise<SignatureData[]> {
    return this.signatures.filter((sig) => sig.deliveryId === deliveryId);
  }

  async deleteSignature(id: string): Promise<void> {
    const signature = this.signatures.find(s => s.id === id);
    if (!signature) return;

    try {
      // Supprimer l'image de la galerie
      if (Platform.OS === 'android') {
        await CameraRoll.deletePhotos([signature.imageUri]);
      }

      // Supprimer le fichier
      await RNFS.unlink(signature.imageUri);

      // Supprimer de la liste
      this.signatures = this.signatures.filter((sig) => sig.id !== id);
      await this.saveSignaturesToCache();
    } catch (error) {
      console.error('Error deleting signature:', error);
      throw error;
    }
  }

  async cleanupOldSignatures(maxAge: number = 90 * 24 * 60 * 60 * 1000) { // 90 jours par défaut
    const now = Date.now();
    const oldSignatures = this.signatures.filter(sig => now - sig.date.getTime() > maxAge);

    for (const signature of oldSignatures) {
      await this.deleteSignature(signature.id);
    }
  }
}

export const signatureService = new SignatureService();
