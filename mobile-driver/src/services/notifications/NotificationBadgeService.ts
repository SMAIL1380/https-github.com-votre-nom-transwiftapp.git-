import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { BehaviorSubject } from 'rxjs';

interface BadgeCounts {
  total: number;
  delivery: number;
  maintenance: number;
  message: number;
  alert: number;
}

export class NotificationBadgeService {
  private static instance: NotificationBadgeService;
  private badgeCounts = new BehaviorSubject<BadgeCounts>({
    total: 0,
    delivery: 0,
    maintenance: 0,
    message: 0,
    alert: 0,
  });

  private constructor() {
    this.initializeBadges();
  }

  static getInstance(): NotificationBadgeService {
    if (!NotificationBadgeService.instance) {
      NotificationBadgeService.instance = new NotificationBadgeService();
    }
    return NotificationBadgeService.instance;
  }

  private async initializeBadges() {
    try {
      const storedCounts = await AsyncStorage.getItem('badge_counts');
      if (storedCounts) {
        const counts = JSON.parse(storedCounts);
        this.badgeCounts.next(counts);
        this.updateSystemBadge(counts.total);
      }
    } catch (error) {
      console.error('Error initializing badges:', error);
    }
  }

  private async updateSystemBadge(count: number) {
    if (Platform.OS === 'ios') {
      PushNotification.setApplicationIconBadgeNumber(count);
    }
  }

  private async saveBadgeCounts(counts: BadgeCounts) {
    try {
      await AsyncStorage.setItem('badge_counts', JSON.stringify(counts));
    } catch (error) {
      console.error('Error saving badge counts:', error);
    }
  }

  getBadgeCounts() {
    return this.badgeCounts.asObservable();
  }

  async incrementBadge(type: keyof BadgeCounts) {
    const currentCounts = this.badgeCounts.value;
    const newCounts = {
      ...currentCounts,
      [type]: currentCounts[type] + 1,
      total: currentCounts.total + 1,
    };
    
    this.badgeCounts.next(newCounts);
    await this.saveBadgeCounts(newCounts);
    this.updateSystemBadge(newCounts.total);
  }

  async decrementBadge(type: keyof BadgeCounts) {
    const currentCounts = this.badgeCounts.value;
    if (currentCounts[type] > 0) {
      const newCounts = {
        ...currentCounts,
        [type]: currentCounts[type] - 1,
        total: currentCounts.total - 1,
      };
      
      this.badgeCounts.next(newCounts);
      await this.saveBadgeCounts(newCounts);
      this.updateSystemBadge(newCounts.total);
    }
  }

  async clearBadges(type?: keyof BadgeCounts) {
    const currentCounts = this.badgeCounts.value;
    const newCounts = type
      ? {
          ...currentCounts,
          [type]: 0,
          total: currentCounts.total - currentCounts[type],
        }
      : {
          total: 0,
          delivery: 0,
          maintenance: 0,
          message: 0,
          alert: 0,
        };
    
    this.badgeCounts.next(newCounts);
    await this.saveBadgeCounts(newCounts);
    this.updateSystemBadge(newCounts.total);
  }
}

export default NotificationBadgeService.getInstance();
