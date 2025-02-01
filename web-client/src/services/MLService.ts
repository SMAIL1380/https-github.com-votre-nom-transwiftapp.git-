import {
  MLFeatures,
  DemandPrediction,
  RouteOptimization,
  DriverPerformancePrediction,
  CustomerBehaviorPrediction,
  MLModelMetrics
} from '../types/mlModels';

class MLService {
  private readonly API_URL = '/api/ml';

  // Prédiction de la demande
  async predictDemand(features: MLFeatures): Promise<DemandPrediction> {
    try {
      const response = await fetch(`${this.API_URL}/predict/demand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la prédiction de la demande');
      }

      return await response.json();
    } catch (error) {
      console.error('MLService Error:', error);
      throw error;
    }
  }

  // Optimisation d'itinéraire
  async optimizeRoute(
    deliveryPoints: { lat: number; lng: number }[],
    constraints: {
      timeWindows: { start: Date; end: Date }[];
      vehicleCapacity: number;
      maxDuration: number;
    }
  ): Promise<RouteOptimization> {
    try {
      const response = await fetch(`${this.API_URL}/optimize/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryPoints, constraints }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'optimisation de l\'itinéraire');
      }

      return await response.json();
    } catch (error) {
      console.error('MLService Error:', error);
      throw error;
    }
  }

  // Prédiction de performance des chauffeurs
  async predictDriverPerformance(
    driverId: string,
    timeframe: { start: Date; end: Date }
  ): Promise<DriverPerformancePrediction> {
    try {
      const response = await fetch(`${this.API_URL}/predict/driver-performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, timeframe }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la prédiction de performance');
      }

      return await response.json();
    } catch (error) {
      console.error('MLService Error:', error);
      throw error;
    }
  }

  // Prédiction du comportement client
  async predictCustomerBehavior(
    customerId: string,
    orderDetails: {
      restaurantId: string;
      orderTotal: number;
      items: string[];
      deliveryDistance: number;
    }
  ): Promise<CustomerBehaviorPrediction> {
    try {
      const response = await fetch(`${this.API_URL}/predict/customer-behavior`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, orderDetails }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la prédiction du comportement client');
      }

      return await response.json();
    } catch (error) {
      console.error('MLService Error:', error);
      throw error;
    }
  }

  // Métriques des modèles
  async getModelMetrics(modelName: string): Promise<MLModelMetrics> {
    try {
      const response = await fetch(`${this.API_URL}/metrics/${modelName}`);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des métriques');
      }

      return await response.json();
    } catch (error) {
      console.error('MLService Error:', error);
      throw error;
    }
  }

  // Réentraînement des modèles
  async retrainModel(
    modelName: string,
    config: {
      dataRange: { start: Date; end: Date };
      parameters: Record<string, any>;
    }
  ): Promise<{
    success: boolean;
    metrics: MLModelMetrics;
    trainingDuration: number;
  }> {
    try {
      const response = await fetch(`${this.API_URL}/train/${modelName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du réentraînement du modèle');
      }

      return await response.json();
    } catch (error) {
      console.error('MLService Error:', error);
      throw error;
    }
  }

  // Analyse des facteurs d'influence
  async analyzeFeatureImportance(
    modelName: string,
    features: MLFeatures
  ): Promise<Array<{
    feature: string;
    importance: number;
    correlation: number;
  }>> {
    try {
      const response = await fetch(`${this.API_URL}/analyze/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelName, features }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse des facteurs');
      }

      return await response.json();
    } catch (error) {
      console.error('MLService Error:', error);
      throw error;
    }
  }
}

export const mlService = new MLService();
