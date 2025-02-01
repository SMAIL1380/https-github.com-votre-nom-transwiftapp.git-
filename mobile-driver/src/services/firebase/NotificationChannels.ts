import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

export const NotificationChannels = {
  DELIVERY: {
    id: 'delivery_channel',
    name: 'Livraisons',
    description: 'Notifications de livraisons',
    importance: 'high',
    vibration: true,
    sound: 'delivery_sound',
  },
  URGENT: {
    id: 'urgent_channel',
    name: 'Urgences',
    description: 'Notifications urgentes',
    importance: 'max',
    vibration: true,
    sound: 'urgent_sound',
  },
  CHAT: {
    id: 'chat_channel',
    name: 'Messages',
    description: 'Messages et communications',
    importance: 'default',
    vibration: false,
    sound: 'message_sound',
  },
  MAINTENANCE: {
    id: 'maintenance_channel',
    name: 'Maintenance',
    description: 'Alertes de maintenance',
    importance: 'high',
    vibration: true,
    sound: 'maintenance_sound',
  },
  SYSTEM: {
    id: 'system_channel',
    name: 'Système',
    description: 'Notifications système',
    importance: 'low',
    vibration: false,
    sound: 'default',
  },
};

export const initializeNotificationChannels = () => {
  if (Platform.OS === 'android') {
    // Créer les canaux de notification pour Android
    Object.values(NotificationChannels).forEach(channel => {
      PushNotification.createChannel(
        {
          channelId: channel.id,
          channelName: channel.name,
          channelDescription: channel.description,
          importance: channel.importance,
          vibrate: channel.vibration,
          playSound: true,
          soundName: channel.sound,
        },
        (created) => console.log(`Channel ${channel.id} created: ${created}`)
      );
    });
  }
};
