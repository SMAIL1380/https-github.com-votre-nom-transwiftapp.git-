import { useState, useEffect } from 'react';
import { socket } from '@/lib/socket';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  type: 'delivery_update' | 'status_change' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Connexion au socket lors du montage
    const token = localStorage.getItem('token');
    if (token) {
      socket.auth = { token };
      socket.connect();
    }

    // Charger les notifications existantes
    fetchNotifications();

    // Écouter les nouvelles notifications
    socket.on('notification', handleNewNotification);

    // Écouter les mises à jour de livraison
    socket.on('deliveryUpdate', handleDeliveryUpdate);

    return () => {
      socket.off('notification');
      socket.off('deliveryUpdate');
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:3000/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        updateUnreadCount(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    updateUnreadCount([notification, ...notifications]);
    
    // Afficher une notification toast
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none"
          >
            Fermer
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-right',
    });
  };

  const handleDeliveryUpdate = (delivery: any) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'delivery_update',
      title: 'Mise à jour de livraison',
      message: `La livraison ${delivery.trackingNumber} a été mise à jour: ${delivery.status}`,
      read: false,
      createdAt: new Date().toISOString(),
      data: delivery,
    };
    handleNewNotification(notification);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        updateUnreadCount(notifications);
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:3000/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
    }
  };

  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
