import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan, MoreThan } from 'typeorm';
import { Notification, NotificationStatus, NotificationType, NotificationPriority } from '../entities/notification.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PostgresNotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>
  ) {}

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    priority?: NotificationPriority;
    scheduledFor?: Date;
    data?: any;
    actions?: any[];
    groupId?: string;
    tags?: string[];
  }) {
    const notification = this.notificationRepo.create({
      ...data,
      status: data.scheduledFor ? NotificationStatus.PENDING : NotificationStatus.SENT,
      priority: data.priority || NotificationPriority.NORMAL
    });

    return this.notificationRepo.save(notification);
  }

  async createBulkNotifications(notifications: Partial<Notification>[]) {
    const entities = notifications.map(n => this.notificationRepo.create(n));
    return this.notificationRepo.save(entities);
  }

  async getUserNotifications(userId: string, options: {
    page?: number;
    limit?: number;
    type?: NotificationType[];
    status?: NotificationStatus[];
    read?: boolean;
    startDate?: Date;
    endDate?: Date;
    priority?: NotificationPriority[];
    tags?: string[];
  } = {}) {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      read,
      startDate,
      endDate,
      priority,
      tags
    } = options;

    const queryBuilder = this.notificationRepo
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('notification.type IN (:...type)', { type });
    }

    if (status) {
      queryBuilder.andWhere('notification.status IN (:...status)', { status });
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

    if (priority) {
      queryBuilder.andWhere('notification.priority IN (:...priority)', { priority });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('notification.tags && ARRAY[:...tags]', { tags });
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
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getGroupedNotifications(userId: string, groupId: string) {
    return this.notificationRepo.find({
      where: { userId, groupId },
      order: { groupOrder: 'ASC' }
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.notificationRepo.update(
      { id: notificationId, userId },
      { 
        status: NotificationStatus.READ,
        read: true,
        readAt: new Date()
      }
    );
  }

  async markAllAsRead(userId: string, options?: {
    type?: NotificationType;
    beforeDate?: Date;
  }) {
    const queryBuilder = this.notificationRepo
      .createQueryBuilder()
      .update(Notification)
      .set({ 
        status: NotificationStatus.READ,
        read: true,
        readAt: new Date()
      })
      .where('userId = :userId', { userId });

    if (options?.type) {
      queryBuilder.andWhere('type = :type', { type: options.type });
    }

    if (options?.beforeDate) {
      queryBuilder.andWhere('createdAt <= :beforeDate', { beforeDate: options.beforeDate });
    }

    return queryBuilder.execute();
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.notificationRepo.update(
      { id: notificationId, userId },
      { status: NotificationStatus.DELETED }
    );
  }

  @Cron('*/5 * * * *') // Toutes les 5 minutes
  async processScheduledNotifications() {
    const now = new Date();
    const notifications = await this.notificationRepo.find({
      where: {
        status: NotificationStatus.PENDING,
        scheduledFor: LessThan(now)
      }
    });

    for (const notification of notifications) {
      try {
        // Logique d'envoi de notification ici
        notification.status = NotificationStatus.SENT;
      } catch (error) {
        notification.status = NotificationStatus.FAILED;
        notification.error = error.message;
        notification.retryCount++;
      }
    }

    await this.notificationRepo.save(notifications);
  }

  @Cron('0 0 * * *') // Une fois par jour
  async cleanupOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.notificationRepo.delete({
      createdAt: LessThan(thirtyDaysAgo),
      status: In([NotificationStatus.READ, NotificationStatus.DELETED])
    });
  }

  async getNotificationStats(userId: string) {
    const stats = await this.notificationRepo
      .createQueryBuilder('notification')
      .select([
        'type',
        'COUNT(*) as total',
        'SUM(CASE WHEN read = true THEN 1 ELSE 0 END) as read',
        'SUM(CASE WHEN status = :sent THEN 1 ELSE 0 END) as sent',
        'SUM(CASE WHEN status = :failed THEN 1 ELSE 0 END) as failed'
      ])
      .where('userId = :userId', { userId })
      .setParameter('sent', NotificationStatus.SENT)
      .setParameter('failed', NotificationStatus.FAILED)
      .groupBy('type')
      .getRawMany();

    return stats;
  }

  async getUnreadCount(userId: string, type?: NotificationType) {
    const queryBuilder = this.notificationRepo
      .createQueryBuilder('notification')
      .where('userId = :userId', { userId })
      .andWhere('read = false');

    if (type) {
      queryBuilder.andWhere('type = :type', { type });
    }

    return queryBuilder.getCount();
  }
}
