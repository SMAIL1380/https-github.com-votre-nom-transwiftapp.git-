export enum NotificationType {
  DELIVERY = 'delivery',
  MAINTENANCE = 'maintenance',
  MESSAGE = 'message',
  ALERT = 'alert',
  SYSTEM = 'system'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  READ = 'read',
  DELETED = 'deleted'
}

export interface NotificationAction {
  id: string;
  title: string;
  type: string;
  payload?: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  data?: any;
  actions?: NotificationAction[];
  groupId?: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  scheduledFor?: Date;
}

export interface NotificationGroup {
  id: string;
  type: NotificationType;
  title: string;
  notifications: Notification[];
  unreadCount: number;
  lastUpdated: Date;
}

export interface NotificationPreferences {
  sounds: {
    enabled: boolean;
    volume: number;
    types: {
      [key in NotificationType]: {
        enabled: boolean;
        volume: number;
      };
    };
  };
  badges: {
    enabled: boolean;
    types: {
      [key in NotificationType]: boolean;
    };
  };
  pushNotifications: {
    enabled: boolean;
    types: {
      [key in NotificationType]: boolean;
    };
  };
}
