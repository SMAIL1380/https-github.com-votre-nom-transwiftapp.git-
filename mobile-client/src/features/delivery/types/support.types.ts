export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  deliveryId: string;
  userId: string;
  priority: PriorityLevel;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  escalatedFrom?: string;
  resolution?: string;
}

export interface QuickResponse {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  variables?: string[];  // Variables à remplacer comme {trackingNumber}, {eta}, etc.
  usageCount: number;
  lastUsed?: string;
  createdBy: string;
  isPublic: boolean;  // Si false, uniquement visible par l'agent qui l'a créé
}

export interface SupportAgent {
  id: string;
  name: string;
  role: 'agent' | 'supervisor' | 'admin';
  specialties: string[];  // ex: ['urgent', 'technical', 'billing']
  languages: string[];
  isAvailable: boolean;
  currentLoad: number;  // Nombre de conversations actives
  performance: {
    averageResponseTime: number;
    satisfactionRate: number;
    resolutionRate: number;
  };
}

export interface PriorityRule {
  condition: {
    type: 'status' | 'keyword' | 'customer' | 'value' | 'time';
    value: any;
  };
  priority: PriorityLevel;
  autoAssign?: boolean;
  escalateAfter?: number;  // Minutes avant escalade automatique
}

export interface CustomerSupportHistory {
  userId: string;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  lastInteraction: string;
  preferredLanguage: string;
  commonIssues: string[];
  satisfactionScore: number;
  vipStatus: boolean;
}
