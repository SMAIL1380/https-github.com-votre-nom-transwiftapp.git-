import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class NotificationsService {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
  ) {}

  async create(
    type: NotificationType,
    title: string,
    message: string,
    driverId: string,
    metadata?: any,
  ): Promise<Notification> {
    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
    });

    const notification = this.notificationRepository.create({
      type,
      title,
      message,
      driver,
      metadata,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Envoyer la notification via WebSocket
    this.server.to(`driver-${driverId}`).emit('notification', savedNotification);

    return savedNotification;
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async getUnreadNotifications(driverId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        driver: { id: driverId },
        isRead: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getAllNotifications(driverId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        driver: { id: driverId },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Méthodes d'envoi de notifications spécifiques
  async sendDocumentExpiringNotification(
    driverId: string,
    documentType: string,
    expiryDate: Date,
  ): Promise<Notification> {
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );

    return this.create(
      NotificationType.DOCUMENT_EXPIRING,
      'Document expirant bientôt',
      `Votre ${documentType} expire dans ${daysUntilExpiry} jours`,
      driverId,
      { documentType, expiryDate },
    );
  }

  async sendInsuranceExpiringNotification(
    driverId: string,
    vehicleId: string,
    expiryDate: Date,
  ): Promise<Notification> {
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );

    return this.create(
      NotificationType.INSURANCE_EXPIRING,
      'Assurance expirant bientôt',
      `L'assurance de votre véhicule expire dans ${daysUntilExpiry} jours`,
      driverId,
      { vehicleId, expiryDate },
    );
  }

  async sendNewDeliveryNotification(
    driverId: string,
    deliveryId: string,
    pickupAddress: string,
  ): Promise<Notification> {
    return this.create(
      NotificationType.NEW_DELIVERY,
      'Nouvelle livraison disponible',
      `Nouvelle livraison à partir de ${pickupAddress}`,
      driverId,
      { deliveryId, pickupAddress },
    );
  }

  async sendNewReviewNotification(
    driverId: string,
    rating: number,
    comment?: string,
  ): Promise<Notification> {
    return this.create(
      NotificationType.NEW_REVIEW,
      'Nouvel avis reçu',
      `Vous avez reçu un nouvel avis : ${rating} étoiles`,
      driverId,
      { rating, comment },
    );
  }
}
