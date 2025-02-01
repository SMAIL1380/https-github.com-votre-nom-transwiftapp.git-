export interface DeliveryPrediction {
  timeSlot: string;
  demandLevel: 'low' | 'medium' | 'high';
  predictedOrders: number;
  confidence: number;
  hotspots: HotspotPrediction[];
}

export interface HotspotPrediction {
  location: {
    lat: number;
    lng: number;
  };
  intensity: number;
  predictedDuration: number;
  type: 'restaurant' | 'shopping' | 'event' | 'residential';
}

export interface WeatherImpact {
  condition: string;
  impact: 'positive' | 'negative' | 'neutral';
  intensityPercent: number;
}

export interface TrafficPrediction {
  timeSlot: string;
  congestionLevel: 'low' | 'medium' | 'high';
  averageDelay: number;
  alternativeRoutes: boolean;
}

export interface PredictionFactors {
  weather: WeatherImpact;
  events: Array<{
    name: string;
    impact: number;
    location: {
      lat: number;
      lng: number;
    };
  }>;
  historicalData: {
    averageOrders: number;
    peakHours: string[];
    reliability: number;
  };
}

export interface OptimizationSuggestion {
  type: 'route' | 'schedule' | 'area';
  priority: 'high' | 'medium' | 'low';
  description: string;
  expectedImpact: {
    metric: string;
    improvement: number;
  };
  implementationDifficulty: 'easy' | 'medium' | 'hard';
}

export interface PerformanceMetrics {
  deliverySpeed: number;
  customerSatisfaction: number;
  efficiency: number;
  earnings: number;
}
