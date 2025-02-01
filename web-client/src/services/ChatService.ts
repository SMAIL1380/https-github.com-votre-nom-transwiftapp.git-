import {
  ChatMessage,
  ChatRoom,
  ChatParticipant,
  SupportTicket,
  ChatNotification,
  ChatSettings,
  ChatAnalytics
} from '../types/chat';

class ChatService {
  private readonly API_URL = '/api/chat';
  private socket: WebSocket;

  constructor() {
    this.socket = new WebSocket('ws://localhost:8080/chat');
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    this.socket.onopen = () => {
      console.log('Chat WebSocket connection established');
    };

    this.socket.onclose = () => {
      console.log('Chat WebSocket connection closed');
      // Tentative de reconnexion après 5 secondes
      setTimeout(() => this.initializeWebSocket(), 5000);
    };

    this.socket.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
    };
  }

  // Messages
  async sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>): Promise<ChatMessage> {
    try {
      const response = await fetch(`${this.API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'envoi du message');
      return await response.json();
    } catch (error) {
      console.error('ChatService Error:', error);
      throw error;
    }
  }

  async getMessages(
    chatRoomId: string,
    options: {
      limit: number;
      before?: Date;
      includeSystem?: boolean;
    }
  ): Promise<ChatMessage[]> {
    try {
      const queryParams = new URLSearchParams({
        limit: options.limit.toString(),
        ...(options.before && { before: options.before.toISOString() }),
        ...(options.includeSystem !== undefined && { includeSystem: options.includeSystem.toString() })
      });

      const response = await fetch(
        `${this.API_URL}/rooms/${chatRoomId}/messages?${queryParams}`
      );
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des messages');
      return await response.json();
    } catch (error) {
      console.error('ChatService Error:', error);
      throw error;
    }
  }

  // Salles de chat
  async createChatRoom(
    type: ChatRoom['type'],
    participants: string[]
  ): Promise<ChatRoom> {
    try {
      const response = await fetch(`${this.API_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, participants }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la création de la salle');
      return await response.json();
    } catch (error) {
      console.error('ChatService Error:', error);
      throw error;
    }
  }

  async getChatRooms(
    options: {
      type?: ChatRoom['type'];
      status?: ChatRoom['status'];
      limit?: number;
    } = {}
  ): Promise<ChatRoom[]> {
    try {
      const queryParams = new URLSearchParams(
        Object.entries(options)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, value.toString()])
      );

      const response = await fetch(`${this.API_URL}/rooms?${queryParams}`);
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des salles');
      return await response.json();
    } catch (error) {
      console.error('ChatService Error:', error);
      throw error;
    }
  }

  // Support
  async createSupportTicket(
    ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SupportTicket> {
    try {
      const response = await fetch(`${this.API_URL}/support/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la création du ticket');
      return await response.json();
    } catch (error) {
      console.error('ChatService Error:', error);
      throw error;
    }
  }

  async updateTicketStatus(
    ticketId: string,
    update: {
      status: SupportTicket['status'];
      resolution?: SupportTicket['resolution'];
    }
  ): Promise<SupportTicket> {
    try {
      const response = await fetch(`${this.API_URL}/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la mise à jour du ticket');
      return await response.json();
    } catch (error) {
      console.error('ChatService Error:', error);
      throw error;
    }
  }

  // Notifications
  async getNotifications(
    options: {
      unreadOnly?: boolean;
      limit?: number;
      before?: Date;
    } = {}
  ): Promise<ChatNotification[]> {
    try {
      const queryParams = new URLSearchParams(
        Object.entries(options)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, value.toString()])
      );

      const response = await fetch(`${this.API_URL}/notifications?${queryParams}`);
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des notifications');
      return await response.json();
    } catch (error) {
      console.error('ChatService Error:', error);
      throw error;
    }
  }

  async markNotificationsAsRead(notificationIds: string[]): Promise<void> {
    try {
      const response = await fetch(`${this.API_URL}/notifications/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });
      
      if (!response.ok) throw new Error('Erreur lors du marquage des notifications');
    } catch (error) {
      console.error('ChatService Error:', error);
      throw error;
    }
  }

  // Paramètres
  async updateSettings(settings: Partial<ChatSettings>): Promise<ChatSettings> {
    try {
      const response = await fetch(`${this.API_URL}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la mise à jour des paramètres');
      return await response.json();
    } catch (error) {
      console.error('ChatService Error:', error);
      throw error;
    }
  }

  // Analytics
  async getChatAnalytics(
    period: { start: Date; end: Date }
  ): Promise<ChatAnalytics> {
    try {
      const response = await fetch(
        `${this.API_URL}/analytics?start=${period.start.toISOString()}&end=${period.end.toISOString()}`
      );
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des analytics');
      return await response.json();
    } catch (error) {
      console.error('ChatService Error:', error);
      throw error;
    }
  }

  // WebSocket event listeners
  onMessage(callback: (message: ChatMessage) => void) {
    this.socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        callback(data.payload);
      }
    });
  }

  onStatusChange(callback: (participant: ChatParticipant) => void) {
    this.socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'status') {
        callback(data.payload);
      }
    });
  }

  onTyping(callback: (data: { userId: string; roomId: string; typing: boolean }) => void) {
    this.socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'typing') {
        callback(data.payload);
      }
    });
  }
}

export const chatService = new ChatService();
