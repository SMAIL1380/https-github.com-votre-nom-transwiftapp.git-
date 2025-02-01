import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    throw new Error('Les notifications nécessitent un appareil physique');
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    throw new Error('Permission refusée pour les notifications');
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Enregistrer le token sur le serveur
  await api.post('/drivers/push-token', { token });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
};

export const setupNotificationListeners = (
  onNewDelivery: (delivery: any) => void,
  onDeliveryUpdate: (update: any) => void
) => {
  const notificationListener = Notifications.addNotificationReceivedListener(
    notification => {
      const data = notification.request.content.data;
      
      switch (data.type) {
        case 'NEW_DELIVERY':
          onNewDelivery(data.delivery);
          break;
        case 'DELIVERY_UPDATE':
          onDeliveryUpdate(data.update);
          break;
      }
    }
  );

  const responseListener = Notifications.addNotificationResponseReceivedListener(
    response => {
      const data = response.notification.request.content.data;
      // Gérer les actions quand l'utilisateur clique sur la notification
    }
  );

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
};
