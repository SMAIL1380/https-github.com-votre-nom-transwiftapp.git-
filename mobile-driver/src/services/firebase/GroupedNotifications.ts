import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GroupedNotification {
  groupId: string;
  title: string;
  messages: Array<{
    id: string;
    message: string;
    timestamp: number;
  }>;
  count: number;
  lastUpdated: number;
}

class GroupedNotifications {
  private static instance: GroupedNotifications;
  private groups: Map<string, GroupedNotification> = new Map();

  private constructor() {
    this.loadStoredGroups();
  }

  static getInstance(): GroupedNotifications {
    if (!GroupedNotifications.instance) {
      GroupedNotifications.instance = new GroupedNotifications();
    }
    return GroupedNotifications.instance;
  }

  private async loadStoredGroups() {
    try {
      const storedGroups = await AsyncStorage.getItem('notification_groups');
      if (storedGroups) {
        const parsedGroups = JSON.parse(storedGroups);
        this.groups = new Map(Object.entries(parsedGroups));
      }
    } catch (error) {
      console.error('Error loading stored notification groups:', error);
    }
  }

  private async saveGroups() {
    try {
      const groupsObject = Object.fromEntries(this.groups);
      await AsyncStorage.setItem('notification_groups', JSON.stringify(groupsObject));
    } catch (error) {
      console.error('Error saving notification groups:', error);
    }
  }

  async addToGroup(
    groupId: string,
    notificationId: string,
    message: string,
    groupTitle: string
  ) {
    let group = this.groups.get(groupId);

    if (!group) {
      group = {
        groupId,
        title: groupTitle,
        messages: [],
        count: 0,
        lastUpdated: Date.now(),
      };
      this.groups.set(groupId, group);
    }

    // Ajouter le nouveau message
    group.messages.push({
      id: notificationId,
      message,
      timestamp: Date.now(),
    });

    // Limiter à 5 messages maximum par groupe
    if (group.messages.length > 5) {
      group.messages = group.messages.slice(-5);
    }

    group.count = group.messages.length;
    group.lastUpdated = Date.now();

    await this.saveGroups();
    this.showGroupedNotification(group);
  }

  private showGroupedNotification(group: GroupedNotification) {
    // Créer un résumé des messages
    const summary = group.messages
      .slice(-3)
      .map(msg => msg.message)
      .join('\n');

    const extraCount = Math.max(0, group.count - 3);
    const extraMessage = extraCount > 0 ? `\n+${extraCount} autres messages` : '';

    PushNotification.localNotification({
      title: group.title,
      message: `${summary}${extraMessage}`,
      group: group.groupId,
      groupSummary: true,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
      userInfo: {
        groupId: group.groupId,
        count: group.count,
      },
    });
  }

  async removeFromGroup(groupId: string, notificationId: string) {
    const group = this.groups.get(groupId);
    if (group) {
      group.messages = group.messages.filter(msg => msg.id !== notificationId);
      group.count = group.messages.length;

      if (group.count === 0) {
        this.groups.delete(groupId);
      } else {
        group.lastUpdated = Date.now();
      }

      await this.saveGroups();
      
      if (group.count > 0) {
        this.showGroupedNotification(group);
      }
    }
  }

  async clearGroup(groupId: string) {
    this.groups.delete(groupId);
    await this.saveGroups();
    
    PushNotification.cancelAllLocalNotifications();
  }

  async getGroupSummary(groupId: string): Promise<GroupedNotification | null> {
    return this.groups.get(groupId) || null;
  }

  async getAllGroups(): Promise<GroupedNotification[]> {
    return Array.from(this.groups.values());
  }

  // Nettoyer les groupes anciens (plus de 24h)
  async cleanupOldGroups() {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    for (const [groupId, group] of this.groups.entries()) {
      if (group.lastUpdated < oneDayAgo) {
        this.groups.delete(groupId);
      }
    }
    
    await this.saveGroups();
  }
}

export default GroupedNotifications.getInstance();
