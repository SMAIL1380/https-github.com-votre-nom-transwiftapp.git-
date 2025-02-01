import {
  DeepLearningModel,
  TrainingConfig,
  PredictionResult,
  ModelMetadata,
  TrainingMetrics,
  DeepLearningFeatures
} from '../types/deepLearning';

class DeepLearningService {
  private readonly API_URL = '/api/deep-learning';

  // Gestion des modèles
  async loadModel(modelId: string): Promise<DeepLearningModel> {
    try {
      const response = await fetch(`${this.API_URL}/models/${modelId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement du modèle');
      return await response.json();
    } catch (error) {
      console.error('DeepLearningService Error:', error);
      throw error;
    }
  }

  async createModel(
    name: string,
    architecture: DeepLearningModel['architecture'],
    type: DeepLearningModel['type']
  ): Promise<DeepLearningModel> {
    try {
      const response = await fetch(`${this.API_URL}/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, architecture, type }),
      });
      if (!response.ok) throw new Error('Erreur lors de la création du modèle');
      return await response.json();
    } catch (error) {
      console.error('DeepLearningService Error:', error);
      throw error;
    }
  }

  // Entraînement
  async trainModel(
    modelId: string,
    features: DeepLearningFeatures,
    config: TrainingConfig
  ): Promise<{
    modelId: string;
    status: string;
    trainingJobId: string;
  }> {
    try {
      const response = await fetch(`${this.API_URL}/models/${modelId}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features, config }),
      });
      if (!response.ok) throw new Error('Erreur lors du lancement de l\'entraînement');
      return await response.json();
    } catch (error) {
      console.error('DeepLearningService Error:', error);
      throw error;
    }
  }

  async getTrainingStatus(
    modelId: string,
    trainingJobId: string
  ): Promise<{
    status: 'running' | 'completed' | 'failed';
    progress: number;
    metrics: TrainingMetrics;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${this.API_URL}/models/${modelId}/training-status/${trainingJobId}`
      );
      if (!response.ok) throw new Error('Erreur lors de la récupération du statut');
      return await response.json();
    } catch (error) {
      console.error('DeepLearningService Error:', error);
      throw error;
    }
  }

  // Prédictions
  async predict(
    modelId: string,
    features: DeepLearningFeatures
  ): Promise<PredictionResult> {
    try {
      const response = await fetch(`${this.API_URL}/models/${modelId}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features }),
      });
      if (!response.ok) throw new Error('Erreur lors de la prédiction');
      return await response.json();
    } catch (error) {
      console.error('DeepLearningService Error:', error);
      throw error;
    }
  }

  // Métadonnées et métriques
  async getModelMetadata(modelId: string): Promise<ModelMetadata> {
    try {
      const response = await fetch(`${this.API_URL}/models/${modelId}/metadata`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des métadonnées');
      return await response.json();
    } catch (error) {
      console.error('DeepLearningService Error:', error);
      throw error;
    }
  }

  async getTrainingHistory(
    modelId: string,
    trainingJobId: string
  ): Promise<TrainingMetrics[]> {
    try {
      const response = await fetch(
        `${this.API_URL}/models/${modelId}/history/${trainingJobId}`
      );
      if (!response.ok) throw new Error('Erreur lors de la récupération de l\'historique');
      return await response.json();
    } catch (error) {
      console.error('DeepLearningService Error:', error);
      throw error;
    }
  }

  // Optimisation et fine-tuning
  async optimizeModel(
    modelId: string,
    config: {
      technique: 'pruning' | 'quantization' | 'distillation';
      parameters: Record<string, any>;
    }
  ): Promise<{
    success: boolean;
    optimizedModelId: string;
    improvements: {
      sizeReduction: number;
      speedImprovement: number;
      accuracyDelta: number;
    };
  }> {
    try {
      const response = await fetch(`${this.API_URL}/models/${modelId}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Erreur lors de l\'optimisation');
      return await response.json();
    } catch (error) {
      console.error('DeepLearningService Error:', error);
      throw error;
    }
  }

  async fineTuneModel(
    modelId: string,
    features: DeepLearningFeatures,
    config: {
      epochs: number;
      learningRate: number;
      layersToFreeze: string[];
    }
  ): Promise<{
    success: boolean;
    fineTunedModelId: string;
    improvements: {
      accuracyDelta: number;
      adaptationScore: number;
    };
  }> {
    try {
      const response = await fetch(`${this.API_URL}/models/${modelId}/fine-tune`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features, config }),
      });
      if (!response.ok) throw new Error('Erreur lors du fine-tuning');
      return await response.json();
    } catch (error) {
      console.error('DeepLearningService Error:', error);
      throw error;
    }
  }
}

export const deepLearningService = new DeepLearningService();
