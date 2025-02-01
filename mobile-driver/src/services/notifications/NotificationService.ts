import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BehaviorSubject } from 'rxjs';
import { API_URL } from '@env';
import { 
  Notification, 
  NotificationType, 
  NotificationStatus,
  NotificationPriority 
} from './types';
import { NotificationSoundManager } from './NotificationSoundManager';
import { NotificationBadgeManager } from './NotificationBadgeManager';
import { OfflineNotificationManager } from './OfflineNotificationManager';

class NotificationService {
  private static instance: NotificationService;
  private socket: Socket | null = null;
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private connected$ = new BehaviorSubject<boolean>(false);
  
  private soundManager: NotificationSoundManager;
  private badgeManager: NotificationBadgeManager;
  private offlineManager: OfflineNotificationManager;

  private constructor() {
    this.soundManager = new NotificationSoundManager();
    this.badgeManager = new NotificationBadgeManager();
    this.offlineManager = new OfflineNotificationManager();
    
    this.initializeSocket();
    this.loadInitialNotifications();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initializeSocket() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      this.socket = io(`${API_URL}/notifications`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.setupSocketListeners();
    } catch (error) {
      console.error('Error initializing notification socket:', error);
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connected$.next(true);
      this.syncOfflineNotifications();
    });

    this.socket.on('disconnect', () => {
      this.connected$.next(false);
    });

    this.socket.on('newNotification', async (notification: Notification) => {
      // Mettre à jour la liste des notifications
      const current = this.notifications$.value;
      this.notifications$.next([notification, ...current]);

      // Jouer le son
      await this.soundManager.playSound(notification.type);
      
      // Mettre à jour le badge
      await this.badgeManager.incrementBadge(notification.type);
    });

    this.socket.on('notificationRead', ({ id }) => {
      const current = this.notifications$.value;
      const updated = current.map(n => 
        n.id === id ? { ...n, read: true, readAt: new Date() } : n
      );
      this.notifications$.next(updated);
    });
  }

  private async loadInitialNotifications() {
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const notifications = await response.json();
        this.notifications$.next(notifications);
        
        // Mettre à jour les badges
        await this.badgeManager.syncBadges(notifications);
      }
    } catch (error) {
      console.error('Error loading initial notifications:', error);
      // Charger les notifications hors ligne
      const offlineNotifications = await this.offlineManager.getStoredNotifications();
      this.notifications$.next(offlineNotifications);
    }
  }

  private async syncOfflineNotifications() {
    if (this.connected$.value) {
      await this.offlineManager.syncOfflineNotifications();
      await this.loadInitialNotifications();
    }
  }

  // API publique
  getNotifications() {
    return this.notifications$.asObservable();
  }

  getConnectionStatus() {
    return this.connected$.asObservable();
  }

  async markAsRead(notificationId: string) {
    try {
      if (this.connected$.value) {
        const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('auth_token')}`
          }
        });

        if (response.ok) {
          this.socket?.emit('markAsRead', notificationId);
          await this.badgeManager.decrementBadge(
            this.notifications$.value.find(n => n.id === notificationId)?.type
          );
        }
      } else {
        await this.offlineManager.markNotificationAsRead(notificationId);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead() {
    try {
      if (this.connected$.value) {
        const response = await fetch(`${API_URL}/notifications/read-all`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('auth_token')}`
          }
        });

        if (response.ok) {
          this.socket?.emit('markAllAsRead');
          await this.badgeManager.clearAllBadges();
        }
      } else {
        await this.offlineManager.markAllAsRead();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async deleteNotification(notificationId: string) {
    try {
      if (this.connected$.value) {
        const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('auth_token')}`
          }
        });

        if (response.ok) {
          const current = this.notifications$.value;
          this.notifications$.next(current.filter(n => n.id !== notificationId));
        }
      } else {
        await this.offlineManager.deleteNotification(notificationId);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  // Gestion des préférences
  async updateSoundPreferences(enabled: boolean, volume: number) {
    await this.soundManager.updatePreferences(enabled, volume);
  }

  async updateBadgePreferences(enabled: boolean) {
    await this.badgeManager.updatePreferences(enabled);
  }

  // Nettoyage
  cleanup() {
    this.socket?.disconnect();
    this.soundManager.cleanup();
    this.offlineManager.cleanup();
  }
}

export default NotificationService.getInstance();
