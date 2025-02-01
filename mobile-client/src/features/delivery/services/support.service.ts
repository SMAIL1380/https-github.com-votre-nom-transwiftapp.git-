import axios from 'axios';
import { API_URL } from '../../../config';
import {
  SupportTicket,
  QuickResponse,
  PriorityLevel,
  CustomerSupportHistory,
  PriorityRule,
} from '../types/support.types';

class SupportService {
  private priorityRules: PriorityRule[] = [
    {
      condition: { type: 'keyword', value: ['urgent', 'immédiat', 'emergency'] },
      priority: 'urgent',
      autoAssign: true,
      escalateAfter: 5,
    },
    {
      condition: { type: 'status', value: 'delivered' },
      priority: 'low',
    },
    {
      condition: { type: 'value', value: 1000 },  // Valeur de livraison > 1000€
      priority: 'high',
    },
    {
      condition: { type: 'customer', value: 'vip' },
      priority: 'high',
      autoAssign: true,
    },
    {
      condition: { type: 'time', value: 48 },  // Pas de réponse depuis 48h
      priority: 'high',
      escalateAfter: 60,
    },
  ];

  async createTicket(
    deliveryId: string,
    userId: string,
    category: string,
    subject: string
  ): Promise<SupportTicket> {
    const response = await axios.post<SupportTicket>(`${API_URL}/support/tickets`, {
      deliveryId,
      userId,
      category,
      subject,
      priority: await this.determinePriority(deliveryId, userId, subject),
    });
    return response.data;
  }

  async getQuickResponses(
    category?: string,
    tags?: string[]
  ): Promise<QuickResponse[]> {
    const response = await axios.get<QuickResponse[]>(
      `${API_URL}/support/quick-responses`,
      {
        params: { category, tags },
      }
    );
    return response.data;
  }

  async useQuickResponse(
    responseId: string,
    variables: Record<string, string>
  ): Promise<string> {
    const response = await axios.get<QuickResponse>(
      `${API_URL}/support/quick-responses/${responseId}`
    );
    
    let content = response.data.content;
    
    // Remplacer les variables
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    // Mettre à jour les statistiques d'utilisation
    await axios.post(`${API_URL}/support/quick-responses/${responseId}/use`);

    return content;
  }

  async getCustomerHistory(userId: string): Promise<CustomerSupportHistory> {
    const response = await axios.get<CustomerSupportHistory>(
      `${API_URL}/support/customers/${userId}/history`
    );
    return response.data;
  }

  private async determinePriority(
    deliveryId: string,
    userId: string,
    subject: string
  ): Promise<PriorityLevel> {
    // Récupérer les informations nécessaires
    const [delivery, customer] = await Promise.all([
      axios.get(`${API_URL}/deliveries/${deliveryId}`),
      this.getCustomerHistory(userId),
    ]);

    // Vérifier chaque règle de priorité
    for (const rule of this.priorityRules) {
      switch (rule.condition.type) {
        case 'keyword':
          if (rule.condition.value.some((keyword: string) =>
            subject.toLowerCase().includes(keyword)
          )) {
            return rule.priority;
          }
          break;

        case 'status':
          if (delivery.data.status === rule.condition.value) {
            return rule.priority;
          }
          break;

        case 'value':
          if (delivery.data.value > rule.condition.value) {
            return rule.priority;
          }
          break;

        case 'customer':
          if (customer.vipStatus && rule.condition.value === 'vip') {
            return rule.priority;
          }
          break;

        case 'time':
          const lastInteractionTime = new Date(customer.lastInteraction).getTime();
          const hoursSinceLastInteraction = 
            (Date.now() - lastInteractionTime) / (1000 * 60 * 60);
          if (hoursSinceLastInteraction > rule.condition.value) {
            return rule.priority;
          }
          break;
      }
    }

    return 'medium';  // Priorité par défaut
  }

  async escalateTicket(
    ticketId: string,
    reason: string,
    newPriority?: PriorityLevel
  ): Promise<SupportTicket> {
    const response = await axios.post<SupportTicket>(
      `${API_URL}/support/tickets/${ticketId}/escalate`,
      {
        reason,
        priority: newPriority,
      }
    );
    return response.data;
  }
}

export const supportService = new SupportService();
