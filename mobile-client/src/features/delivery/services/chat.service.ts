import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, SendMessageRequest, ChatResponse, ChatTicket } from '../types/chat.types';
import { API_URL, WS_URL } from '../../../config';

class ChatService {
  private socket: Socket | null = null;
  private deliveryId: string | null = null;

  connect(deliveryId: string, onMessage: (message: ChatMessage) => void) {
    this.deliveryId = deliveryId;
    this.socket = io(`${WS_URL}/chat`, {
      query: { deliveryId },
      transports: ['websocket'],
    });

    this.socket.on('message', onMessage);
    this.socket.on('messageStatus', this.handleMessageStatus);

    return () => {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
    };
  }

  async sendMessage(request: SendMessageRequest): Promise<ChatMessage> {
    const response = await axios.post<ChatMessage>(
      `${API_URL}/chat/messages`,
      request
    );
    return response.data;
  }

  async getMessages(
    deliveryId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    messages: ChatMessage[];
    hasMore: boolean;
  }> {
    const response = await axios.get<{
      messages: ChatMessage[];
      hasMore: boolean;
    }>(`${API_URL}/chat/messages`, {
      params: {
        deliveryId,
        page,
        limit,
      },
    });
    return response.data;
  }

  async getTicket(deliveryId: string): Promise<ChatTicket> {
    const response = await axios.get<ChatTicket>(
      `${API_URL}/chat/tickets/${deliveryId}`
    );
    return response.data;
  }

  private handleMessageStatus = (update: {
    messageId: string;
    status: ChatMessage['status'];
  }) => {
    if (this.socket) {
      this.socket.emit('messageStatus', update);
    }
  };
}

export const chatService = new ChatService();
