import * as Notifications from 'expo-notifications';
import { DeliveryStatus } from '../types/delivery.types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const DeliveryNotificationsService = {
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async scheduleStatusNotification(
    deliveryId: string,
    status: DeliveryStatus,
    title: string,
    body: string
  ) {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { deliveryId, status },
      },
      trigger: null, // Immediate notification
    });
  },

  getStatusNotificationContent(status: DeliveryStatus, trackingNumber: string) {
    switch (status) {
      case 'accepted':
        return {
          title: 'Livraison acceptée',
          body: `Votre livraison #${trackingNumber} a été acceptée par un chauffeur`,
        };
      case 'picked_up':
        return {
          title: 'Colis récupéré',
          body: `Votre colis #${trackingNumber} a été récupéré par le chauffeur`,
        };
      case 'in_transit':
        return {
          title: 'En route',
          body: `Votre livraison #${trackingNumber} est en cours de route`,
        };
      case 'delivered':
        return {
          title: 'Livré',
          body: `Votre colis #${trackingNumber} a été livré avec succès`,
        };
      case 'cancelled':
        return {
          title: 'Livraison annulée',
          body: `Votre livraison #${trackingNumber} a été annulée`,
        };
      default:
        return {
          title: 'Mise à jour de la livraison',
          body: `Statut de votre livraison #${trackingNumber} mis à jour`,
        };
    }
  },

  async handleIncomingNotification(notification: Notifications.Notification) {
    const { deliveryId, status } = notification.request.content.data;
    // Vous pouvez ajouter ici une logique pour gérer les notifications
    // Par exemple, mettre à jour le state de l'application ou naviguer vers l'écran de suivi
  },
};
