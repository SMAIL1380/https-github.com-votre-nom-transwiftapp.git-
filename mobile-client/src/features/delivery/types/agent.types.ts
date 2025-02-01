export interface AgentNote {
  id: string;
  ticketId: string;
  agentId: string;
  content: string;
  type: 'internal' | 'transfer' | 'escalation' | 'resolution';
  visibility: 'private' | 'team' | 'all';
  createdAt: string;
  attachments?: {
    type: string;
    url: string;
    name: string;
  }[];
  mentions?: string[];  // IDs des agents mentionnés
}

export interface AgentTransfer {
  id: string;
  ticketId: string;
  fromAgentId: string;
  toAgentId: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  priority: 'normal' | 'urgent';
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface ResponseTemplate {
  id: string;
  agentId: string;
  teamId?: string;
  title: string;
  content: string;
  variables: string[];
  category: string;
  tags: string[];
  isShared: boolean;
  language: string;
  lastModified: string;
  usageStats: {
    totalUses: number;
    successRate: number;
    averageRating: number;
  };
}

export interface AgentDashboardMetrics {
  performance: {
    responseTime: {
      average: number;
      trend: number;
      byPriority: Record<string, number>;
    };
    resolution: {
      rate: number;
      averageTime: number;
      firstContactResolution: number;
    };
    satisfaction: {
      current: number;
      trend: number;
      byCategory: Record<string, number>;
    };
    workload: {
      activeTickets: number;
      pendingTransfers: number;
      escalations: number;
    };
  };
  teamMetrics?: {
    onlineAgents: number;
    queueLength: number;
    averageWaitTime: number;
    unassignedTickets: number;
  };
  customerMetrics: {
    totalConversations: number;
    repeatContacts: number;
    channelPreferences: Record<string, number>;
  };
}

export interface AgentAvailability {
  id: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  customStatus?: string;
  lastActive: string;
  currentLoad: number;
  maxLoad: number;
  specialties: string[];
  languages: string[];
  schedule?: {
    start: string;
    end: string;
    timezone: string;
  };
}

export interface TeamMetrics {
  id: string;
  name: string;
  metrics: {
    activeTickets: number;
    resolvedToday: number;
    averageResponseTime: number;
    satisfactionScore: number;
    backlog: number;
  };
  agents: {
    total: number;
    online: number;
    busy: number;
  };
  distribution: {
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  };
  trends: {
    ticketVolume: number[];
    responseTime: number[];
    satisfaction: number[];
  };
}
