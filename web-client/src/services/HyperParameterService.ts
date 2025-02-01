import {
  HyperParameter,
  OptimizationConfig,
  OptimizationTrial,
  OptimizationResult,
  ParameterImportance,
  OptimizationSpace,
  OptimizationStrategy
} from '../types/hyperparameters';

class HyperParameterService {
  private readonly API_URL = '/api/hyperparameters';

  // Configuration de l'espace de recherche
  async defineSearchSpace(
    modelId: string,
    space: OptimizationSpace
  ): Promise<{ spaceId: string }> {
    try {
      const response = await fetch(`${this.API_URL}/space`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, space }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la définition de l\'espace de recherche');
      return await response.json();
    } catch (error) {
      console.error('HyperParameterService Error:', error);
      throw error;
    }
  }

  // Lancement de l'optimisation
  async startOptimization(
    modelId: string,
    spaceId: string,
    config: OptimizationConfig
  ): Promise<{
    optimizationId: string;
    estimatedDuration: number;
  }> {
    try {
      const response = await fetch(`${this.API_URL}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, spaceId, config }),
      });
      
      if (!response.ok) throw new Error('Erreur lors du lancement de l\'optimisation');
      return await response.json();
    } catch (error) {
      console.error('HyperParameterService Error:', error);
      throw error;
    }
  }

  // Suivi de l'optimisation
  async getOptimizationStatus(
    optimizationId: string
  ): Promise<{
    status: 'running' | 'completed' | 'failed';
    progress: number;
    currentBest: OptimizationResult;
    activeTrials: OptimizationTrial[];
  }> {
    try {
      const response = await fetch(
        `${this.API_URL}/status/${optimizationId}`
      );
      
      if (!response.ok) throw new Error('Erreur lors de la récupération du statut');
      return await response.json();
    } catch (error) {
      console.error('HyperParameterService Error:', error);
      throw error;
    }
  }

  // Analyse des résultats
  async analyzeResults(
    optimizationId: string
  ): Promise<{
    parameterImportance: ParameterImportance[];
    convergenceAnalysis: {
      convergenceSpeed: number;
      plateaus: { start: number; end: number; value: number }[];
      recommendations: string[];
    };
    correlationMatrix: Record<string, Record<string, number>>;
  }> {
    try {
      const response = await fetch(
        `${this.API_URL}/analyze/${optimizationId}`
      );
      
      if (!response.ok) throw new Error('Erreur lors de l\'analyse des résultats');
      return await response.json();
    } catch (error) {
      console.error('HyperParameterService Error:', error);
      throw error;
    }
  }

  // Suggestions d'optimisation
  async getSuggestions(
    modelId: string,
    currentParams: Record<string, any>,
    constraints: {
      maxChanges: number;
      targetMetric: string;
      minImprovement: number;
    }
  ): Promise<{
    suggestions: Array<{
      parameter: string;
      currentValue: any;
      suggestedValue: any;
      expectedImprovement: number;
      confidence: number;
    }>;
    reasoning: string[];
  }> {
    try {
      const response = await fetch(`${this.API_URL}/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, currentParams, constraints }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la génération des suggestions');
      return await response.json();
    } catch (error) {
      console.error('HyperParameterService Error:', error);
      throw error;
    }
  }

  // Optimisation automatique
  async autoOptimize(
    modelId: string,
    strategy: OptimizationStrategy
  ): Promise<{
    optimizationId: string;
    strategy: {
      name: string;
      phases: Array<{
        phase: string;
        duration: number;
        expectedImprovement: number;
      }>;
    };
    schedule: {
      estimatedStart: Date;
      estimatedEnd: Date;
      checkpoints: Date[];
    };
  }> {
    try {
      const response = await fetch(`${this.API_URL}/auto-optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, strategy }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'optimisation automatique');
      return await response.json();
    } catch (error) {
      console.error('HyperParameterService Error:', error);
      throw error;
    }
  }

  // Gestion des contraintes
  async validateConstraints(
    spaceId: string,
    parameters: Record<string, any>
  ): Promise<{
    valid: boolean;
    violations: Array<{
      constraint: string;
      message: string;
      severity: 'warning' | 'error';
    }>;
    suggestions: Record<string, any>;
  }> {
    try {
      const response = await fetch(`${this.API_URL}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId, parameters }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la validation des contraintes');
      return await response.json();
    } catch (error) {
      console.error('HyperParameterService Error:', error);
      throw error;
    }
  }
}

export const hyperParameterService = new HyperParameterService();
