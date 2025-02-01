import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import { BehaviorSubject } from 'rxjs';
import { NotificationType, Notification } from './types';

interface BadgeCounts {
  total: number;
  [NotificationType.DELIVERY]: number;
  [NotificationType.MAINTENANCE]: number;
  [NotificationType.MESSAGE]: number;
  [NotificationType.ALERT]: number;
  [NotificationType.SYSTEM]: number;
}

export class NotificationBadgeManager {
  private badgeCounts = new BehaviorSubject<BadgeCounts>({
    total: 0,
    [NotificationType.DELIVERY]: 0,
    [NotificationType.MAINTENANCE]: 0,
    [NotificationType.MESSAGE]: 0,
    [NotificationType.ALERT]: 0,
    [NotificationType.SYSTEM]: 0
  });

  private enabled: boolean = true;

  constructor() {
    this.loadBadges();
    this.loadPreferences();
  }

  private async loadBadges() {
    try {
      const stored = await AsyncStorage.getItem('notification_badges');
      if (stored) {
        const counts = JSON.parse(stored);
        this.badgeCounts.next(counts);
        this.updateSystemBadge(counts.total);
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  }

  private async loadPreferences() {
    try {
      const prefs = await AsyncStorage.getItem('notification_badge_prefs');
      if (prefs) {
        const { enabled } = JSON.parse(prefs);
        this.enabled = enabled;
      }
    } catch (error) {
      console.error('Error loading badge preferences:', error);
    }
  }

  private async updateSystemBadge(count: number) {
    if (!this.enabled) return;

    if (Platform.OS === 'ios') {
      PushNotification.setApplicationIconBadgeNumber(count);
    }
  }

  private async saveBadges(counts: BadgeCounts) {
    try {
      await AsyncStorage.setItem('notification_badges', JSON.stringify(counts));
    } catch (error) {
      console.error('Error saving badges:', error);
    }
  }

  getBadgeCounts() {
    return this.badgeCounts.asObservable();
  }

  async incrementBadge(type: NotificationType) {
    if (!this.enabled) return;

    const current = this.badgeCounts.value;
    const newCounts = {
      ...current,
      [type]: current[type] + 1,
      total: current.total + 1
    };

    this.badgeCounts.next(newCounts);
    await this.saveBadges(newCounts);
    this.updateSystemBadge(newCounts.total);
  }

  async decrementBadge(type: NotificationType) {
    if (!this.enabled) return;

    const current = this.badgeCounts.value;
    if (current[type] > 0) {
      const newCounts = {
        ...current,
        [type]: current[type] - 1,
        total: current.total - 1
      };

      this.badgeCounts.next(newCounts);
      await this.saveBadges(newCounts);
      this.updateSystemBadge(newCounts.total);
    }
  }

  async syncBadges(notifications: Notification[]) {
    if (!this.enabled) return;

    const counts: BadgeCounts = {
      total: 0,
      [NotificationType.DELIVERY]: 0,
      [NotificationType.MAINTENANCE]: 0,
      [NotificationType.MESSAGE]: 0,
      [NotificationType.ALERT]: 0,
      [NotificationType.SYSTEM]: 0
    };

    notifications.forEach(notification => {
      if (!notification.read) {
        counts[notification.type]++;
        counts.total++;
      }
    });

    this.badgeCounts.next(counts);
    await this.saveBadges(counts);
    this.updateSystemBadge(counts.total);
  }

  async clearAllBadges() {
    if (!this.enabled) return;

    const emptyCounts: BadgeCounts = {
      total: 0,
      [NotificationType.DELIVERY]: 0,
      [NotificationType.MAINTENANCE]: 0,
      [NotificationType.MESSAGE]: 0,
      [NotificationType.ALERT]: 0,
      [NotificationType.SYSTEM]: 0
    };

    this.badgeCounts.next(emptyCounts);
    await this.saveBadges(emptyCounts);
    this.updateSystemBadge(0);
  }

  async updatePreferences(enabled: boolean) {
    this.enabled = enabled;
    
    try {
      await AsyncStorage.setItem(
        'notification_badge_prefs',
        JSON.stringify({ enabled })
      );

      if (!enabled) {
        await this.clearAllBadges();
      }
    } catch (error) {
      console.error('Error saving badge preferences:', error);
    }
  }
}
