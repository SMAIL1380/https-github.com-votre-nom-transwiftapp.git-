export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'location' | 'system';
  status: 'sent' | 'delivered' | 'read';
  metadata?: {
    location?: {
      lat: number;
      lng: number;
      address?: string;
    };
    imageUrl?: string;
    systemAction?: {
      type: string;
      data: any;
    };
  };
}

export interface ChatRoom {
  id: string;
  type: 'direct' | 'support' | 'group';
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived' | 'closed';
}

export interface ChatParticipant {
  id: string;
  type: 'driver' | 'customer' | 'support' | 'system';
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  typing?: boolean;
}

export interface SupportTicket {
  id: string;
  chatRoomId: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  subject: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  resolution?: {
    resolvedBy: string;
    resolvedAt: Date;
    solution: string;
    feedback?: {
      rating: number;
      comment?: string;
    };
  };
}

export interface ChatNotification {
  id: string;
  type: 'message' | 'support' | 'system';
  title: string;
  body: string;
  chatRoomId?: string;
  timestamp: Date;
  read: boolean;
  priority: 'normal' | 'high';
  action?: {
    type: string;
    data: any;
  };
}

export interface ChatSettings {
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    preview: boolean;
  };
  privacy: {
    showStatus: boolean;
    showTyping: boolean;
    readReceipts: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    language: string;
  };
  support: {
    autoTranslate: boolean;
    preferredLanguage: string;
    availabilityHours: {
      start: string;
      end: string;
      timezone: string;
    };
  };
}

export interface ChatAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  messages: {
    total: number;
    byType: Record<string, number>;
    averageResponseTime: number;
  };
  support: {
    tickets: number;
    averageResolutionTime: number;
    satisfactionRate: number;
  };
  engagement: {
    activeUsers: number;
    messagesByHour: Record<string, number>;
    popularCategories: Array<{
      category: string;
      count: number;
    }>;
  };
}
