import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import { Notification } from '../entities/notification.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>
  ) {
    // Initialisation de Firebase Admin
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
  }

  async sendPushNotification(
    userId: string,
    fcmToken: string,
    title: string,
    body: string,
    data: any = {}
  ) {
    try {
      // Créer la notification dans la base de données
      const notification = this.notificationRepository.create({
        userId,
        type: data.type || 'general',
        title,
        body,
        data,
        status: 'pending',
      });

      // Envoyer via Firebase
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          notificationId: notification.id,
        },
        token: fcmToken,
        android: {
          priority: 'high',
          notification: {
            channelId: data.type || 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const result = await admin.messaging().send(message);
      
      // Mettre à jour le statut
      notification.status = 'sent';
      notification.externalId = result;
      
      await this.notificationRepository.save(notification);
      
      return notification;
    } catch (error) {
      console.error('Erreur d\'envoi de notification:', error);
      
      // Sauvegarder l'erreur
      const failedNotification = this.notificationRepository.create({
        userId,
        type: data.type || 'general',
        title,
        body,
        data,
        status: 'failed',
        error: error.message,
      });
      
      await this.notificationRepository.save(failedNotification);
      throw error;
    }
  }

  async getNotifications(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      type?: string;
      read?: boolean;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const {
      page = 1,
      limit = 20,
      type,
      read,
      startDate,
      endDate,
    } = options;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    if (read !== undefined) {
      queryBuilder.andWhere('notification.read = :read', { read });
    }

    if (startDate) {
      queryBuilder.andWhere('notification.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('notification.createdAt <= :endDate', { endDate });
    }

    const [notifications, total] = await queryBuilder
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.notificationRepository.update(
      { id: notificationId, userId },
      { read: true, readAt: new Date() }
    );
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepository.update(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.notificationRepository.delete({ id: notificationId, userId });
  }

  async getNotificationStats(userId: string) {
    const stats = await this.notificationRepository
      .createQueryBuilder('notification')
      .select([
        'notification.type',
        'COUNT(*) as total',
        'SUM(CASE WHEN notification.read = true THEN 1 ELSE 0 END) as read',
        'SUM(CASE WHEN notification.status = \'sent\' THEN 1 ELSE 0 END) as sent',
        'SUM(CASE WHEN notification.status = \'failed\' THEN 1 ELSE 0 END) as failed',
      ])
      .where('notification.userId = :userId', { userId })
      .groupBy('notification.type')
      .getRawMany();

    return stats;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('createdAt < :date', { date: thirtyDaysAgo })
      .andWhere('read = true')
      .execute();
  }

  async resendFailedNotifications() {
    const failedNotifications = await this.notificationRepository.find({
      where: { status: 'failed' },
      take: 100,
    });

    for (const notification of failedNotifications) {
      try {
        await this.sendPushNotification(
          notification.userId,
          notification.data.fcmToken,
          notification.title,
          notification.body,
          notification.data
        );
      } catch (error) {
        console.error(
          `Échec de la réexpédition pour la notification ${notification.id}:`,
          error
        );
      }
    }
  }

  async getNotificationAnalytics(userId: string, period: 'day' | 'week' | 'month') {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .select([
        'DATE_TRUNC(:period, notification.createdAt) as date',
        'notification.type',
        'COUNT(*) as count',
      ])
      .where('notification.userId = :userId', { userId })
      .groupBy('date, notification.type')
      .orderBy('date', 'DESC');

    switch (period) {
      case 'day':
        queryBuilder.andWhere('notification.createdAt >= NOW() - INTERVAL \'24 hours\'');
        break;
      case 'week':
        queryBuilder.andWhere('notification.createdAt >= NOW() - INTERVAL \'7 days\'');
        break;
      case 'month':
        queryBuilder.andWhere('notification.createdAt >= NOW() - INTERVAL \'30 days\'');
        break;
    }

    const analytics = await queryBuilder.setParameter('period', period).getRawMany();

    return analytics;
  }
}
