import { SyncItem, SyncResult } from '../types';
import { signatureService } from '../../../features/signature/services/SignatureService';
import { apiClient } from '../../api/apiClient';

export class SignatureSyncHandler {
  async syncItem(item: SyncItem): Promise<SyncResult> {
    try {
      const signature = signatureService.getSignatureById(item.entityId);
      if (!signature) {
        return {
          success: false,
          error: 'Signature not found',
          timestamp: Date.now(),
        };
      }

      // Préparer les données de la signature
      const signatureData = {
        id: signature.id,
        deliveryId: signature.deliveryId,
        timestamp: signature.timestamp,
        imageData: signature.imageData,
        signedBy: signature.signedBy,
      };

      // Envoyer au backend
      const response = await apiClient.post('/api/signatures/upload', signatureData);

      if (response.status === 200) {
        // Mettre à jour le statut de la signature
        signatureService.markSignatureAsSynced(signature.id);

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

  async checkSignatureValidation(signatureId: string): Promise<void> {
    try {
      const response = await apiClient.get(`/api/signatures/${signatureId}/validation`);
      
      if (response.status === 200) {
        const { isValid, validatedBy, validatedAt } = response.data;
        
        // Mettre à jour le statut local de la signature
        signatureService.updateSignatureValidation(signatureId, {
          isValid,
          validatedBy,
          validatedAt,
        });
      }
    } catch (error) {
      console.error('Error checking signature validation:', error);
    }
  }
}
