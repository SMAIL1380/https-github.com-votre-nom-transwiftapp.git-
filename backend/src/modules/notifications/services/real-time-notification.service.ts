import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Order } from '../../orders/entities/order.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Incident } from '../../incidents/entities/incident.entity';

interface LocationUpdate {
  vehicleId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
}

interface DeliveryUpdate {
  orderId: string;
  status: string;
  location?: LocationUpdate;
  estimatedArrival?: Date;
  message?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class RealTimeNotificationService {
  @WebSocketServer()
  private server: Server;

  private clientConnections: Map<string, Socket> = new Map();
  private vehicleConnections: Map<string, Socket> = new Map();
  private adminConnections: Set<Socket> = new Set();

  handleConnection(client: Socket) {
    const { type, id } = client.handshake.query;

    switch (type) {
      case 'client':
        this.clientConnections.set(id as string, client);
        break;
      case 'vehicle':
        this.vehicleConnections.set(id as string, client);
        break;
      case 'admin':
        this.adminConnections.add(client);
        break;
    }

    client.on('disconnect', () => {
      this.clientConnections.delete(id as string);
      this.vehicleConnections.delete(id as string);
      this.adminConnections.delete(client);
    });
  }

  async sendLocationUpdate(update: LocationUpdate): Promise<void> {
    // Envoyer aux clients concernés
    const affectedOrders = await this.findAffectedOrders(update.vehicleId);
    for (const order of affectedOrders) {
      const clientSocket = this.clientConnections.get(order.clientId);
      if (clientSocket) {
        clientSocket.emit('locationUpdate', {
          orderId: order.id,
          location: update,
          estimatedArrival: order.estimatedDeliveryTime,
        });
      }
    }

    // Envoyer aux administrateurs
    this.broadcastToAdmins('vehicleLocationUpdate', update);
  }

  async sendDeliveryUpdate(update: DeliveryUpdate): Promise<void> {
    // Notifier le client
    const clientSocket = this.clientConnections.get(update.orderId);
    if (clientSocket) {
      clientSocket.emit('deliveryUpdate', update);

      // Envoyer une notification push si disponible
      await this.sendPushNotification(update.orderId, {
        title: 'Mise à jour de votre livraison',
        body: update.message || `Statut: ${update.status}`,
        data: {
          orderId: update.orderId,
          status: update.status,
        },
      });
    }

    // Notifier les administrateurs
    this.broadcastToAdmins('deliveryUpdate', update);
  }

  async sendIncidentNotification(
    incident: Incident,
    recipients: string[],
  ): Promise<void> {
    const notification = this.formatIncidentNotification(incident);

    // Notifier les clients affectés
    for (const recipientId of recipients) {
      const clientSocket = this.clientConnections.get(recipientId);
      if (clientSocket) {
        clientSocket.emit('incidentNotification', notification);
      }
    }

    // Notifier les véhicules concernés
    if (incident.vehicle) {
      const vehicleSocket = this.vehicleConnections.get(incident.vehicle.id);
      if (vehicleSocket) {
        vehicleSocket.emit('incidentAlert', {
          ...notification,
          instructions: this.getDriverInstructions(incident),
        });
      }
    }

    // Notifier les administrateurs
    this.broadcastToAdmins('incidentAlert', {
      ...notification,
      fullDetails: incident,
    });

    // Envoyer des notifications push
    await this.sendMultiplePushNotifications(recipients, {
      title: `Incident ${incident.severity}: ${incident.type}`,
      body: notification.message,
      data: {
        incidentId: incident.id,
        type: incident.type,
        severity: incident.severity,
      },
    });
  }

  async sendStatusUpdate(
    orderId: string,
    status: string,
    details: any,
  ): Promise<void> {
    const clientSocket = this.clientConnections.get(orderId);
    if (clientSocket) {
      clientSocket.emit('statusUpdate', {
        orderId,
        status,
        details,
        timestamp: new Date(),
      });
    }
  }

  async sendETAUpdate(
    orderId: string,
    newETA: Date,
    reason?: string,
  ): Promise<void> {
    const clientSocket = this.clientConnections.get(orderId);
    if (clientSocket) {
      clientSocket.emit('etaUpdate', {
        orderId,
        estimatedArrival: newETA,
        reason,
        timestamp: new Date(),
      });
    }
  }

  async sendEmergencyAlert(
    vehicleId: string,
    alert: {
      type: string;
      message: string;
      location: LocationUpdate;
    },
  ): Promise<void> {
    // Notifier immédiatement les administrateurs
    this.broadcastToAdmins('emergencyAlert', {
      vehicleId,
      ...alert,
      timestamp: new Date(),
    });

    // Notifier le véhicule
    const vehicleSocket = this.vehicleConnections.get(vehicleId);
    if (vehicleSocket) {
      vehicleSocket.emit('emergencyInstructions', {
        message: this.getEmergencyInstructions(alert.type),
        timestamp: new Date(),
      });
    }
  }

  private broadcastToAdmins(event: string, data: any): void {
    this.adminConnections.forEach((socket) => {
      socket.emit(event, {
        ...data,
        timestamp: new Date(),
      });
    });
  }

  private formatIncidentNotification(incident: Incident): any {
    return {
      id: incident.id,
      type: incident.type,
      severity: incident.severity,
      message: this.generateIncidentMessage(incident),
      impact: {
        estimatedDelay: incident.impact.estimatedDelay,
        affectedOrders: incident.impact.affectedOrders,
      },
      timestamp: new Date(),
    };
  }

  private generateIncidentMessage(incident: Incident): string {
    let message = '';
    switch (incident.type) {
      case 'DELAY':
        message = `Retard estimé de ${incident.impact.estimatedDelay} minutes`;
        break;
      case 'BREAKDOWN':
        message = 'Panne véhicule - Réaffectation en cours';
        break;
      case 'WEATHER':
        message = 'Conditions météorologiques défavorables';
        break;
      default:
        message = incident.description;
    }
    return message;
  }

  private getDriverInstructions(incident: Incident): string {
    // Instructions spécifiques selon le type d'incident
    switch (incident.type) {
      case 'BREAKDOWN':
        return `
1. Sécurisez le véhicule
2. Contactez le service technique
3. Attendez les instructions
4. N'abandonnez pas le véhicule`;
      case 'ACCIDENT':
        return `
1. Vérifiez les blessés
2. Appelez les secours si nécessaire
3. Prenez des photos
4. Remplissez le constat`;
      default:
        return incident.resolution.steps
          .map((step) => step.action)
          .join('\n');
    }
  }

  private getEmergencyInstructions(type: string): string {
    switch (type) {
      case 'MEDICAL':
        return 'Services d\'urgence contactés. Restez calme. Secours en route.';
      case 'SECURITY':
        return 'Sécurité alertée. Verrouillez le véhicule. Attendez les renforts.';
      case 'TECHNICAL':
        return 'Service technique notifié. Suivez les procédures de sécurité.';
      default:
        return 'Restez en sécurité. Aide en route.';
    }
  }

  private async findAffectedOrders(vehicleId: string): Promise<Order[]> {
    // Implémenter la recherche des commandes affectées
    return [];
  }

  private async sendPushNotification(
    recipientId: string,
    notification: {
      title: string;
      body: string;
      data?: any;
    },
  ): Promise<void> {
    // Implémenter l'envoi de notification push
    // Utiliser Firebase Cloud Messaging ou un service similaire
  }

  private async sendMultiplePushNotifications(
    recipientIds: string[],
    notification: {
      title: string;
      body: string;
      data?: any;
    },
  ): Promise<void> {
    await Promise.all(
      recipientIds.map((id) => this.sendPushNotification(id, notification)),
    );
  }
}
