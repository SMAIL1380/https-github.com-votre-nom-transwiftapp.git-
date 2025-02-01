import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeNotificationChannels } from './NotificationChannels';

class FirebaseConfig {
  private static instance: FirebaseConfig;

  private constructor() {}

  static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  async initialize() {
    // Initialiser les canaux de notification
    initializeNotificationChannels();

    // Demander la permission pour les notifications (iOS)
    if (Platform.OS === 'ios') {
      await this.requestIOSPermissions();
    }

    // Configurer les gestionnaires de notifications
    this.setupNotificationHandlers();

    // Obtenir et sauvegarder le token FCM
    await this.updateFCMToken();
  }

  private async requestIOSPermissions() {
    const authStatus = await messaging().requestPermission({
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      provisional: false,
      sound: true,
    });

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('User declined push notifications');
    }
  }

  private setupNotificationHandlers() {
    // Gestionnaire de notification en arrière-plan
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background:', remoteMessage);
    });

    // Gestionnaire de notification en premier plan
    messaging().onMessage(async remoteMessage => {
      console.log('Message received in foreground:', remoteMessage);
    });

    // Gestionnaire de clic sur notification
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('App opened from background state:', remoteMessage);
    });

    // Gestionnaire de notification initiale
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from quit state:', remoteMessage);
        }
      });
  }

  async updateFCMToken() {
    try {
      const fcmToken = await messaging().getToken();
      await AsyncStorage.setItem('fcmToken', fcmToken);
      
      // Envoyer le token au serveur
      await this.sendTokenToServer(fcmToken);
      
      // Configurer le listener de rafraîchissement du token
      messaging().onTokenRefresh(async (newToken) => {
        await AsyncStorage.setItem('fcmToken', newToken);
        await this.sendTokenToServer(newToken);
      });

      return fcmToken;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  private async sendTokenToServer(token: string) {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch('YOUR_API_ENDPOINT/update-fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          token,
          platform: Platform.OS,
          appVersion: Platform.Version,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update FCM token on server');
      }
    } catch (error) {
      console.error('Error sending FCM token to server:', error);
    }
  }

  async subscribeToPushNotifications() {
    try {
      await messaging().subscribeToTopic('all_drivers');
      await AsyncStorage.setItem('notificationsEnabled', 'true');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  }

  async unsubscribeFromPushNotifications() {
    try {
      await messaging().unsubscribeFromTopic('all_drivers');
      await AsyncStorage.setItem('notificationsEnabled', 'false');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  }
}

export default FirebaseConfig.getInstance();
