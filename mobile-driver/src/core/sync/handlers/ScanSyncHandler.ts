import { SyncItem, SyncResult } from '../types';
import { scannerService } from '../../../features/scanner/services/ScannerService';
import { apiClient } from '../../api/apiClient';

export class ScanSyncHandler {
  async syncItem(item: SyncItem): Promise<SyncResult> {
    try {
      const scan = scannerService.getScanById(item.entityId);
      if (!scan) {
        return {
          success: false,
          error: 'Scan not found',
          timestamp: Date.now(),
        };
      }

      // Préparer les données du scan
      const scanData = {
        id: scan.id,
        deliveryId: scan.deliveryId,
        type: scan.type, // QR ou barcode
        content: scan.content,
        timestamp: scan.timestamp,
        location: scan.location,
      };

      // Envoyer au backend pour validation
      const response = await apiClient.post('/api/scans/validate', scanData);

      if (response.status === 200) {
        const { isValid, validationMessage } = response.data;
        
        // Mettre à jour le statut local du scan
        scannerService.updateScanValidation(scan.id, {
          isValid,
          validationMessage,
        });

        return {
          success: true,
          timestamp: Date.now(),
        };
      } else {
        return {
          success: false,
          error: `Validation failed with status ${response.status}`,
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

  async checkScanValidation(scanId: string): Promise<void> {
    try {
      const response = await apiClient.get(`/api/scans/${scanId}/validation`);
      
      if (response.status === 200) {
        const { 
          isValid,
          validationMessage,
          validatedBy,
          validatedAt 
        } = response.data;
        
        // Mettre à jour le statut local du scan
        scannerService.updateScanValidation(scanId, {
          isValid,
          validationMessage,
          validatedBy,
          validatedAt,
        });
      }
    } catch (error) {
      console.error('Error checking scan validation:', error);
    }
  }
}
