import { Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Client } from 'pg';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { AuthService } from '../../auth/services/auth.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: 'notifications',
})
export class NotificationWebsocketService implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private pgClient: Client;
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private authService: AuthService,
  ) {
    // Initialiser le client PostgreSQL pour LISTEN/NOTIFY
    this.pgClient = new Client({
      connectionString: this.configService.get('DATABASE_URL'),
    });
  }

  async onModuleInit() {
    await this.pgClient.connect();
    
    // Écouter les notifications PostgreSQL
    await this.pgClient.query('LISTEN new_notification');
    
    this.pgClient.on('notification', async (notification) => {
      try {
        const payload = JSON.parse(notification.payload);
        const userSockets = this.userSockets.get(payload.userId);
        
        if (userSockets) {
          const notificationData = await this.notificationService.getNotificationById(
            payload.id
          );
          
          userSockets.forEach((socketId) => {
            this.server.to(socketId).emit('newNotification', notificationData);
          });
        }
      } catch (error) {
        console.error('Error processing PostgreSQL notification:', error);
      }
    });
  }

  // Gérer la connexion d'un client WebSocket
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const user = await this.authService.validateToken(token);
      if (!user) {
        client.disconnect();
        return;
      }

      // Stocker l'association utilisateur-socket
      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, new Set());
      }
      this.userSockets.get(user.id).add(client.id);

      // Joindre les canaux spécifiques
      client.join(`user:${user.id}`);
      if (user.roles?.includes('driver')) {
        client.join('drivers');
      }

      // Envoyer les notifications non lues
      const unreadNotifications = await this.notificationService.getUnreadNotifications(
        user.id
      );
      client.emit('unreadNotifications', unreadNotifications);

    } catch (error) {
      console.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  // Gérer la déconnexion
  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  // Marquer une notification comme lue
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(client: Socket, notificationId: string) {
    try {
      const user = await this.getUserFromSocket(client);
      if (!user) return;

      await this.notificationService.markAsRead(notificationId, user.id);
      client.emit('notificationRead', { id: notificationId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      client.emit('error', { message: 'Failed to mark notification as read' });
    }
  }

  // Marquer toutes les notifications comme lues
  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(client: Socket) {
    try {
      const user = await this.getUserFromSocket(client);
      if (!user) return;

      await this.notificationService.markAllAsRead(user.id);
      client.emit('allNotificationsRead');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      client.emit('error', { message: 'Failed to mark all notifications as read' });
    }
  }

  // Récupérer l'historique des notifications
  @SubscribeMessage('getNotificationHistory')
  async handleGetHistory(client: Socket, data: { page: number; limit: number }) {
    try {
      const user = await this.getUserFromSocket(client);
      if (!user) return;

      const history = await this.notificationService.getUserNotifications(
        user.id,
        data
      );
      client.emit('notificationHistory', history);
    } catch (error) {
      console.error('Error fetching notification history:', error);
      client.emit('error', { message: 'Failed to fetch notification history' });
    }
  }

  // Envoyer une notification à un utilisateur spécifique
  async sendToUser(userId: string, notification: any) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach((socketId) => {
        this.server.to(socketId).emit('newNotification', notification);
      });
    }
  }

  // Envoyer une notification à un groupe d'utilisateurs
  async sendToGroup(groupName: string, notification: any) {
    this.server.to(groupName).emit('newNotification', notification);
  }

  // Envoyer une notification à tous les utilisateurs
  async broadcastNotification(notification: any) {
    this.server.emit('newNotification', notification);
  }

  private async getUserFromSocket(client: Socket) {
    const token = client.handshake.auth.token;
    if (!token) return null;
    return this.authService.validateToken(token);
  }
}
