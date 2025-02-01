import React, { useState, useEffect } from 'react';
import { chatService } from '../../services/ChatService';
import { ChatNotification } from '../../types/chat';
import './ChatNotifications.css';

interface ChatNotificationsProps {
  onNotificationClick?: (notification: ChatNotification) => void;
}

export default function ChatNotifications({ onNotificationClick }: ChatNotificationsProps) {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();

    // Écouter les nouvelles notifications via WebSocket
    chatService.socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        const newNotification = data.payload as ChatNotification;
        setNotifications(prev => [newNotification, ...prev]);
        if (!newNotification.read) {
          setUnreadCount(prev => prev + 1);
        }
      }
    });
  }, []);

  const loadNotifications = async () => {
    try {
      const loadedNotifications = await chatService.getNotifications({
        limit: 20,
        unreadOnly: false
      });
      
      setNotifications(loadedNotifications);
      setUnreadCount(loadedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  const handleNotificationClick = async (notification: ChatNotification) => {
    if (!notification.read) {
      try {
        await chatService.markNotificationsAsRead([notification.id]);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => prev - 1);
      } catch (error) {
        console.error('Erreur lors du marquage de la notification:', error);
      }
    }

    onNotificationClick?.(notification);
    setIsOpen(false);
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id);
      
      if (unreadIds.length > 0) {
        await chatService.markNotificationsAsRead(unreadIds);
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
    }
  };

  const renderNotificationContent = (notification: ChatNotification) => {
    switch (notification.type) {
      case 'message':
        return (
          <>
            <div className="notification-title">{notification.title}</div>
            <p className="notification-body">{notification.body}</p>
          </>
        );
      
      case 'support':
        return (
          <>
            <div className="notification-title">Support - {notification.title}</div>
            <p className="notification-body">{notification.body}</p>
            {notification.action && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Gérer l'action spécifique du support
                  if (notification.action.type === 'view_ticket') {
                    // Navigation vers le ticket
                  }
                }}
                className="notification-action-button"
              >
                Voir le ticket
              </button>
            )}
          </>
        );
      
      case 'system':
        return (
          <>
            <div className="notification-title">Système</div>
            <p className="notification-body">{notification.body}</p>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="chat-notifications">
      <button
        className="notifications-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="notifications-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="mark-all-read"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                Aucune notification
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`notification-item ${!notification.read ? 'unread' : ''} ${
                    notification.priority === 'high' ? 'high-priority' : ''
                  }`}
                >
                  {renderNotificationContent(notification)}
                  <div className="notification-meta">
                    <span className="notification-time">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                    {!notification.read && (
                      <span className="unread-indicator" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
