import {
  ModelFeedback,
  PredictionFeedback,
  PerformanceFeedback,
  ErrorFeedback,
  FeedbackAnalysis,
  FeedbackAction,
  AutomatedResponse,
  FeedbackMetrics
} from '../types/feedback';

class FeedbackService {
  private readonly API_URL = '/api/feedback';

  // Soumission de feedback
  async submitFeedback(
    feedback: ModelFeedback | PredictionFeedback | PerformanceFeedback | ErrorFeedback
  ): Promise<{ id: string; status: string }> {
    try {
      const response = await fetch(`${this.API_URL}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la soumission du feedback');
      return await response.json();
    } catch (error) {
      console.error('FeedbackService Error:', error);
      throw error;
    }
  }

  // Analyse du feedback
  async analyzeFeedback(
    modelId: string,
    period: { start: Date; end: Date }
  ): Promise<FeedbackAnalysis> {
    try {
      const response = await fetch(`${this.API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, period }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'analyse du feedback');
      return await response.json();
    } catch (error) {
      console.error('FeedbackService Error:', error);
      throw error;
    }
  }

  // Création d'action
  async createAction(action: Omit<FeedbackAction, 'id'>): Promise<FeedbackAction> {
    try {
      const response = await fetch(`${this.API_URL}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la création de l\'action');
      return await response.json();
    } catch (error) {
      console.error('FeedbackService Error:', error);
      throw error;
    }
  }

  // Mise à jour du statut d'action
  async updateActionStatus(
    actionId: string,
    update: {
      status: FeedbackAction['status'];
      progress: number;
      results?: FeedbackAction['results'];
    }
  ): Promise<FeedbackAction> {
    try {
      const response = await fetch(`${this.API_URL}/actions/${actionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'action');
      return await response.json();
    } catch (error) {
      console.error('FeedbackService Error:', error);
      throw error;
    }
  }

  // Réponse automatisée
  async triggerAutomatedResponse(
    feedbackId: string,
    config: {
      types: AutomatedResponse['type'][];
      threshold: number;
      maxActions: number;
    }
  ): Promise<AutomatedResponse> {
    try {
      const response = await fetch(`${this.API_URL}/automated-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId, config }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la réponse automatisée');
      return await response.json();
    } catch (error) {
      console.error('FeedbackService Error:', error);
      throw error;
    }
  }

  // Métriques de feedback
  async getFeedbackMetrics(
    modelId: string,
    period: { start: Date; end: Date }
  ): Promise<FeedbackMetrics> {
    try {
      const response = await fetch(
        `${this.API_URL}/metrics/${modelId}?start=${period.start.toISOString()}&end=${period.end.toISOString()}`
      );
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des métriques');
      return await response.json();
    } catch (error) {
      console.error('FeedbackService Error:', error);
      throw error;
    }
  }

  // Agrégation de feedback
  async aggregateFeedback(
    modelId: string,
    config: {
      groupBy: ('type' | 'severity' | 'status')[];
      metrics: string[];
      period: { start: Date; end: Date };
    }
  ): Promise<{
    groups: Record<string, {
      count: number;
      metrics: Record<string, number>;
    }>;
    trends: {
      metric: string;
      values: { timestamp: Date; value: number }[];
    }[];
  }> {
    try {
      const response = await fetch(`${this.API_URL}/aggregate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, config }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'agrégation du feedback');
      return await response.json();
    } catch (error) {
      console.error('FeedbackService Error:', error);
      throw error;
    }
  }

  // Suggestions d'amélioration
  async getImprovementSuggestions(
    modelId: string,
    context: {
      recentFeedback: number;
      performanceThreshold: number;
      resourceConstraints: Record<string, number>;
    }
  ): Promise<{
    suggestions: Array<{
      type: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      estimatedImpact: number;
      implementation: {
        difficulty: 'easy' | 'medium' | 'hard';
        steps: string[];
        requirements: string[];
      };
    }>;
    metrics: {
      currentPerformance: Record<string, number>;
      expectedImprovement: Record<string, number>;
    };
  }> {
    try {
      const response = await fetch(`${this.API_URL}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, context }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des suggestions');
      return await response.json();
    } catch (error) {
      console.error('FeedbackService Error:', error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService();
