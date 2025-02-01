export interface MLFeatures {
  timestamp: number;
  dayOfWeek: number;
  hourOfDay: number;
  isWeekend: boolean;
  isHoliday: boolean;
  weatherCondition: string;
  temperature: number;
  precipitation: number;
  trafficLevel: number;
  nearbyEvents: number;
  historicalDemand: number[];
  activeDrivers: number;
}

export interface DemandPrediction {
  predictedDemand: number;
  confidence: number;
  factors: {
    name: string;
    importance: number;
    impact: number;
  }[];
}

export interface RouteOptimization {
  originalDuration: number;
  optimizedDuration: number;
  improvementPercent: number;
  optimizedRoute: string[];
  confidenceScore: number;
}

export interface DriverPerformancePrediction {
  predictedDeliveries: number;
  predictedEarnings: number;
  predictedRating: number;
  confidenceScores: {
    deliveries: number;
    earnings: number;
    rating: number;
  };
  suggestions: {
    type: string;
    description: string;
    expectedImprovement: number;
  }[];
}

export interface CustomerBehaviorPrediction {
  orderProbability: number;
  expectedTipAmount: number;
  expectedRating: number;
  specialRequests: string[];
  confidence: number;
}

export interface MLModelMetrics {
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrainingDate: Date;
  dataPoints: number;
}
