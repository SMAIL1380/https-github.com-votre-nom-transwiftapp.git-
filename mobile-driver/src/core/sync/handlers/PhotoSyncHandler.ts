import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { SyncItem, SyncResult } from '../types';
import { photoService } from '../../../features/delivery-photos/services/PhotoService';
import { apiClient } from '../../api/apiClient';

export class PhotoSyncHandler {
  async syncItem(item: SyncItem): Promise<SyncResult> {
    try {
      const photo = photoService.getPhotoById(item.entityId);
      if (!photo) {
        return {
          success: false,
          error: 'Photo not found',
          timestamp: Date.now(),
        };
      }

      // Lire le fichier photo
      const fileData = await RNFS.readFile(photo.uri, 'base64');
      
      // Préparer les données pour l'upload
      const formData = new FormData();
      formData.append('photo', {
        uri: Platform.OS === 'android' ? `file://${photo.uri}` : photo.uri,
        type: 'image/jpeg',
        name: `${photo.id}.jpg`,
      });
      formData.append('deliveryId', photo.deliveryId || '');
      formData.append('type', photo.type);
      formData.append('timestamp', photo.timestamp.toString());

      // Envoyer au backend
      const response = await apiClient.post('/api/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        // Mettre à jour le statut de la photo
        photoService.markPhotoAsSynced(photo.id);

        return {
          success: true,
          timestamp: Date.now(),
        };
      } else {
        return {
          success: false,
          error: `Upload failed with status ${response.status}`,
          timestamp: Date.now(),
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  async checkPhotoApprovalStatus(photoId: string): Promise<void> {
    try {
      const response = await apiClient.get(`/api/photos/${photoId}/status`);
      
      if (response.status === 200) {
        const { status } = response.data;
        
        // Mettre à jour le statut local de la photo
        if (status === 'approved') {
          photoService.approvePhoto(photoId);
        } else if (status === 'rejected') {
          photoService.rejectPhoto(photoId);
        }
      }
    } catch (error) {
      console.error('Error checking photo approval status:', error);
    }
  }
}
