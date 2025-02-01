import {
  DeliveryPrediction,
  HotspotPrediction,
  PredictionFactors,
  OptimizationSuggestion,
  PerformanceMetrics,
  TrafficPrediction
} from '../types/predictions';

class PredictionService {
  private readonly API_URL = '/api/predictions';

  async getDeliveryPredictions(
    date: Date,
    area: { lat: number; lng: number; radius: number }
  ): Promise<DeliveryPrediction[]> {
    try {
      const response = await fetch(`${this.API_URL}/delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, area }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des prédictions');
      }

      return await response.json();
    } catch (error) {
      console.error('PredictionService Error:', error);
      throw error;
    }
  }

  async getHotspots(
    timeSlot: string,
    area: { lat: number; lng: number; radius: number }
  ): Promise<HotspotPrediction[]> {
    try {
      const response = await fetch(`${this.API_URL}/hotspots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeSlot, area }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des hotspots');
      }

      return await response.json();
    } catch (error) {
      console.error('PredictionService Error:', error);
      throw error;
    }
  }

  async getPredictionFactors(date: Date): Promise<PredictionFactors> {
    try {
      const response = await fetch(`${this.API_URL}/factors?date=${date.toISOString()}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des facteurs de prédiction');
      }

      return await response.json();
    } catch (error) {
      console.error('PredictionService Error:', error);
      throw error;
    }
  }

  async getOptimizationSuggestions(
    driverId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<OptimizationSuggestion[]> {
    try {
      const response = await fetch(`${this.API_URL}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId, timeRange }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des suggestions d\'optimisation');
      }

      return await response.json();
    } catch (error) {
      console.error('PredictionService Error:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(
    driverId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<PerformanceMetrics> {
    try {
      const response = await fetch(`${this.API_URL}/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId, timeRange }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des métriques de performance');
      }

      return await response.json();
    } catch (error) {
      console.error('PredictionService Error:', error);
      throw error;
    }
  }

  async getTrafficPredictions(
    area: { lat: number; lng: number; radius: number },
    timeRange: { start: Date; end: Date }
  ): Promise<TrafficPrediction[]> {
    try {
      const response = await fetch(`${this.API_URL}/traffic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ area, timeRange }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des prédictions de trafic');
      }

      return await response.json();
    } catch (error) {
      console.error('PredictionService Error:', error);
      throw error;
    }
  }
}

export const predictionService = new PredictionService();
