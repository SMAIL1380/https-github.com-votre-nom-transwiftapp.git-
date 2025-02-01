import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import api from '../api/axios';

export enum NotificationType {
  DELIVERY = 'delivery',
  MESSAGE = 'message',
  ALERT = 'alert',
  REMINDER = 'reminder'
}

interface NotificationAction {
  id: string;
  title: string;
  onPress: () => void;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {
    this.initializePushNotifications();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initializePushNotifications() {
    // Configuration des notifications locales
    PushNotification.configure({
      onNotification: this.onNotificationReceived.bind(this),
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Configuration Firebase Cloud Messaging
    await this.requestUserPermission();
    this.setupFCMListeners();
  }

  private async requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const fcmToken = await this.getFCMToken();
      await this.updateFCMToken(fcmToken);
    }
  }

  private async getFCMToken(): Promise<string> {
    const fcmToken = await messaging().getToken();
    await AsyncStorage.setItem('fcmToken', fcmToken);
    return fcmToken;
  }

  private async updateFCMToken(token: string) {
    try {
      await api.post('/users/update-fcm-token', { token });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du token FCM:', error);
    }
  }

  private setupFCMListeners() {
    // Notification reçue en arrière-plan
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      this.handleNotification(remoteMessage);
    });

    // Notification reçue en premier plan
    messaging().onMessage(async remoteMessage => {
      this.handleNotification(remoteMessage);
    });

    // Gestion du clic sur la notification
    messaging().onNotificationOpenedApp(remoteMessage => {
      this.handleNotificationClick(remoteMessage);
    });
  }

  private async handleNotification(remoteMessage: any) {
    const { type, title, body, data } = remoteMessage.data;

    switch (type) {
      case NotificationType.DELIVERY:
        await this.handleDeliveryNotification(data);
        break;
      case NotificationType.MESSAGE:
        await this.handleMessageNotification(data);
        break;
      case NotificationType.ALERT:
        await this.handleAlertNotification(data);
        break;
      case NotificationType.REMINDER:
        await this.handleReminderNotification(data);
        break;
    }

    // Afficher la notification locale
    this.showLocalNotification(title, body, data);
  }

  private async handleDeliveryNotification(data: any) {
    const actions: NotificationAction[] = [
      {
        id: 'accept',
        title: 'Accepter',
        onPress: async () => {
          try {
            await api.post(`/deliveries/${data.deliveryId}/accept`);
            // Mettre à jour l'interface utilisateur
          } catch (error) {
            console.error('Erreur lors de l\'acceptation de la livraison:', error);
          }
        }
      },
      {
        id: 'reject',
        title: 'Refuser',
        onPress: async () => {
          try {
            await api.post(`/deliveries/${data.deliveryId}/reject`);
            // Mettre à jour l'interface utilisateur
          } catch (error) {
            console.error('Erreur lors du refus de la livraison:', error);
          }
        }
      }
    ];

    this.showActionableNotification(
      'Nouvelle livraison',
      `Livraison #${data.deliveryId} disponible`,
      actions,
      data
    );
  }

  private async handleMessageNotification(data: any) {
    // Stocker le message localement
    await AsyncStorage.setItem(`message_${data.messageId}`, JSON.stringify(data));
  }

  private async handleAlertNotification(data: any) {
    // Gérer les alertes prioritaires
    if (data.priority === 'high') {
      this.showHighPriorityNotification(data);
    }
  }

  private async handleReminderNotification(data: any) {
    // Programmer une notification locale
    this.scheduleLocalNotification(data);
  }

  private showLocalNotification(title: string, body: string, data: any) {
    PushNotification.localNotification({
      title,
      message: body,
      userInfo: data,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
    });
  }

  private showActionableNotification(
    title: string,
    body: string,
    actions: NotificationAction[],
    data: any
  ) {
    PushNotification.localNotification({
      title,
      message: body,
      userInfo: data,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
      actions: actions.map(action => action.title),
    });
  }

  private showHighPriorityNotification(data: any) {
    PushNotification.localNotification({
      title: '🚨 ALERTE IMPORTANTE',
      message: data.message,
      userInfo: data,
      playSound: true,
      soundName: 'alarm',
      importance: 'max',
      priority: 'max',
      vibrate: true,
      vibration: 1000,
    });
  }

  public scheduleLocalNotification(data: any) {
    const { title, message, date } = data;
    PushNotification.localNotificationSchedule({
      title,
      message,
      date: new Date(date),
      userInfo: data,
      allowWhileIdle: true,
      repeatType: data.repeatType,
      repeatTime: data.repeatTime,
    });
  }

  public async getNotificationHistory() {
    try {
      const response = await api.get('/notifications/history');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  public async markAsRead(notificationId: string) {
    try {
      await api.post(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  }

  public async clearNotifications() {
    PushNotification.cancelAllLocalNotifications();
    await AsyncStorage.removeItem('notifications');
  }
}

export default NotificationService.getInstance();
