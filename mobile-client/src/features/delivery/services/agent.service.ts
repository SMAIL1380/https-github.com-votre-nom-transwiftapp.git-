import axios from 'axios';
import { API_URL } from '../../../config';
import {
  AgentNote,
  AgentTransfer,
  ResponseTemplate,
  AgentDashboardMetrics,
  AgentAvailability,
  TeamMetrics,
} from '../types/agent.types';

class AgentService {
  // Notes internes
  async addNote(
    ticketId: string,
    content: string,
    type: AgentNote['type'],
    visibility: AgentNote['visibility'],
    mentions?: string[]
  ): Promise<AgentNote> {
    const response = await axios.post<AgentNote>(
      `${API_URL}/support/tickets/${ticketId}/notes`,
      {
        content,
        type,
        visibility,
        mentions,
      }
    );
    return response.data;
  }

  async getNotes(ticketId: string): Promise<AgentNote[]> {
    const response = await axios.get<AgentNote[]>(
      `${API_URL}/support/tickets/${ticketId}/notes`
    );
    return response.data;
  }

  // Transferts
  async initiateTransfer(
    ticketId: string,
    toAgentId: string,
    reason: string,
    priority: AgentTransfer['priority']
  ): Promise<AgentTransfer> {
    const response = await axios.post<AgentTransfer>(
      `${API_URL}/support/tickets/${ticketId}/transfer`,
      {
        toAgentId,
        reason,
        priority,
      }
    );
    return response.data;
  }

  async respondToTransfer(
    transferId: string,
    accept: boolean,
    notes?: string
  ): Promise<AgentTransfer> {
    const response = await axios.put<AgentTransfer>(
      `${API_URL}/support/transfers/${transferId}`,
      {
        status: accept ? 'accepted' : 'rejected',
        notes,
      }
    );
    return response.data;
  }

  // Modèles de réponse
  async createTemplate(template: Omit<ResponseTemplate, 'id'>): Promise<ResponseTemplate> {
    const response = await axios.post<ResponseTemplate>(
      `${API_URL}/support/templates`,
      template
    );
    return response.data;
  }

  async getTemplates(
    agentId: string,
    teamId?: string
  ): Promise<ResponseTemplate[]> {
    const response = await axios.get<ResponseTemplate[]>(
      `${API_URL}/support/templates`,
      {
        params: { agentId, teamId },
      }
    );
    return response.data;
  }

  async updateTemplate(
    templateId: string,
    updates: Partial<ResponseTemplate>
  ): Promise<ResponseTemplate> {
    const response = await axios.put<ResponseTemplate>(
      `${API_URL}/support/templates/${templateId}`,
      updates
    );
    return response.data;
  }

  // Métriques et tableau de bord
  async getDashboardMetrics(
    agentId: string,
    timeframe: 'day' | 'week' | 'month' = 'day'
  ): Promise<AgentDashboardMetrics> {
    const response = await axios.get<AgentDashboardMetrics>(
      `${API_URL}/support/agents/${agentId}/metrics`,
      {
        params: { timeframe },
      }
    );
    return response.data;
  }

  async getTeamMetrics(
    teamId: string,
    timeframe: 'day' | 'week' | 'month' = 'day'
  ): Promise<TeamMetrics> {
    const response = await axios.get<TeamMetrics>(
      `${API_URL}/support/teams/${teamId}/metrics`,
      {
        params: { timeframe },
      }
    );
    return response.data;
  }

  // Gestion de la disponibilité
  async updateAvailability(
    agentId: string,
    status: AgentAvailability['status'],
    customStatus?: string
  ): Promise<AgentAvailability> {
    const response = await axios.put<AgentAvailability>(
      `${API_URL}/support/agents/${agentId}/availability`,
      {
        status,
        customStatus,
      }
    );
    return response.data;
  }

  async getAvailableAgents(
    specialties?: string[],
    languages?: string[]
  ): Promise<AgentAvailability[]> {
    const response = await axios.get<AgentAvailability[]>(
      `${API_URL}/support/agents/available`,
      {
        params: { specialties, languages },
      }
    );
    return response.data;
  }

  // Analytiques en temps réel
  async subscribeToMetrics(
    agentId: string,
    callback: (metrics: AgentDashboardMetrics) => void
  ): Promise<() => void> {
    // Implémenter la logique WebSocket ici
    const ws = new WebSocket(`${API_URL.replace('http', 'ws')}/support/metrics`);
    
    ws.onmessage = (event) => {
      const metrics = JSON.parse(event.data);
      callback(metrics);
    };

    return () => ws.close();
  }
}

export const agentService = new AgentService();
