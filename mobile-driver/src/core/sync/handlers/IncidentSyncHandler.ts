import { SyncItem, SyncResult } from '../types';
import { incidentService } from '../../../features/incidents/services/IncidentService';
import { apiClient } from '../../api/apiClient';

export class IncidentSyncHandler {
  async syncItem(item: SyncItem): Promise<SyncResult> {
    try {
      const incident = incidentService.getIncidentById(item.entityId);
      if (!incident) {
        return {
          success: false,
          error: 'Incident not found',
          timestamp: Date.now(),
        };
      }

      // Préparer les données de l'incident
      const incidentData = {
        id: incident.id,
        deliveryId: incident.deliveryId,
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        location: incident.location,
        timestamp: incident.timestamp,
        photoIds: incident.photoIds,
      };

      // Envoyer au backend
      const response = await apiClient.post('/api/incidents/report', incidentData);

      if (response.status === 200) {
        // Mettre à jour le statut de l'incident avec les informations du serveur
        const { status, resolution, resolvedBy, resolvedAt } = response.data;
        
        incidentService.updateIncidentStatus(incident.id, status, {
          resolution,
          resolvedBy,
          resolvedAt,
        });

        return {
          success: true,
          timestamp: Date.now(),
        };
      } else {
        return {
          success: false,
          error: `Sync failed with status ${response.status}`,
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

  async checkIncidentStatus(incidentId: string): Promise<void> {
    try {
      const response = await apiClient.get(`/api/incidents/${incidentId}/status`);
      
      if (response.status === 200) {
        const { 
          status,
          resolution,
          resolvedBy,
          resolvedAt,
          adminComments 
        } = response.data;
        
        // Mettre à jour le statut local de l'incident
        incidentService.updateIncidentStatus(incidentId, status, {
          resolution,
          resolvedBy,
          resolvedAt,
          adminComments,
        });
      }
    } catch (error) {
      console.error('Error checking incident status:', error);
    }
  }
}
