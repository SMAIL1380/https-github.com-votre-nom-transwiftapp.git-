export interface ChatMessage {
  id: string;
  deliveryId: string;
  senderId: string;
  senderType: 'user' | 'support' | 'system';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isAutomated?: boolean;
  attachments?: {
    type: string;
    url: string;
    name: string;
  }[];
}

export interface ChatTicket {
  id: string;
  deliveryId: string;
  userId: string;
  status: 'open' | 'resolved' | 'closed';
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  deliveryId: string;
  content: string;
  attachments?: {
    type: string;
    url: string;
    name: string;
  }[];
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  data?: any;
}
