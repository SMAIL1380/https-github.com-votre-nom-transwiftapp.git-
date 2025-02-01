import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { BehaviorSubject } from 'rxjs';
import { NotificationStatus, NotificationType } from '../types/notification';

interface OfflineNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  createdAt: string;
  status: NotificationStatus;
  priority: string;
  actions?: any[];
  groupId?: string;
}

class OfflineNotificationService {
  private static instance: OfflineNotificationService;
  private readonly STORAGE_KEY = 'offline_notifications';
  private readonly SYNC_STATUS_KEY = 'notifications_sync_status';
  private isOnline$ = new BehaviorSubject<boolean>(true);
  private pendingSync$ = new BehaviorSubject<boolean>(false);

  private constructor() {
    this.initializeNetworkListener();
    this.checkPendingSync();
  }

  static getInstance(): OfflineNotificationService {
    if (!OfflineNotificationService.instance) {
      OfflineNotificationService.instance = new OfflineNotificationService();
    }
    return OfflineNotificationService.instance;
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      this.isOnline$.next(isConnected);
      
      if (isConnected) {
        this.syncOfflineNotifications();
      }
    });
  }

  private async checkPendingSync() {
    try {
      const needsSync = await AsyncStorage.getItem(this.SYNC_STATUS_KEY);
      this.pendingSync$.next(needsSync === 'true');
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  }

  async saveNotificationOffline(notification: OfflineNotification) {
    try {
      const stored = await this.getStoredNotifications();
      stored.push(notification);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
      await AsyncStorage.setItem(this.SYNC_STATUS_KEY, 'true');
      this.pendingSync$.next(true);
      
      return true;
    } catch (error) {
      console.error('Error saving offline notification:', error);
      return false;
    }
  }

  async getStoredNotifications(): Promise<OfflineNotification[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored notifications:', error);
      return [];
    }
  }

  async syncOfflineNotifications() {
    if (!this.isOnline$.value || !this.pendingSync$.value) return;

    try {
      const stored = await this.getStoredNotifications();
      if (stored.length === 0) {
        await this.clearSyncStatus();
        return;
      }

      // Trier par date de création
      const sortedNotifications = stored.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      for (const notification of sortedNotifications) {
        try {
          // Envoyer la notification au serveur
          await this.syncNotification(notification);
          
          // Supprimer la notification synchronisée
          const remaining = await this.getStoredNotifications();
          const updated = remaining.filter(n => n.id !== notification.id);
          await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('Error syncing notification:', error);
          // Continuer avec la suivante
        }
      }

      // Vérifier si toutes les notifications ont été synchronisées
      const remaining = await this.getStoredNotifications();
      if (remaining.length === 0) {
        await this.clearSyncStatus();
      }
    } catch (error) {
      console.error('Error during sync process:', error);
    }
  }

  private async syncNotification(notification: OfflineNotification) {
    // Implémenter la logique d'envoi au serveur ici
    // Exemple :
    // await api.post('/notifications/sync', notification);
  }

  private async clearSyncStatus() {
    await AsyncStorage.removeItem(this.SYNC_STATUS_KEY);
    this.pendingSync$.next(false);
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      const stored = await this.getStoredNotifications();
      const updated = stored.map(n =>
        n.id === notificationId
          ? { ...n, status: NotificationStatus.READ }
          : n
      );
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async deleteNotification(notificationId: string) {
    try {
      const stored = await this.getStoredNotifications();
      const updated = stored.filter(n => n.id !== notificationId);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  getIsOnline$() {
    return this.isOnline$.asObservable();
  }

  getPendingSync$() {
    return this.pendingSync$.asObservable();
  }

  // Nettoyer les anciennes notifications
  async cleanupOldNotifications(daysToKeep = 30) {
    try {
      const stored = await this.getStoredNotifications();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const filtered = stored.filter(
        n => new Date(n.createdAt) > cutoffDate
      );

      if (filtered.length !== stored.length) {
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  }
}

export default OfflineNotificationService.getInstance();
