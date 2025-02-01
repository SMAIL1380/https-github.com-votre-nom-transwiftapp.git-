export interface RealTimeMetrics {
  activeUsers: number;
  onlineDrivers: number;
  currentDeliveries: number;
  pendingOrders: number;
  averageResponseTime: number;
  currentRevenue: number;
}

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  latency: number;
  errorRate: number;
  requestsPerSecond: number;
}

export interface UserActivityMetrics {
  newUsers: number;
  activeChats: number;
  supportTickets: number;
  averageSessionDuration: number;
  bounceRate: number;
}

export interface LocationMetrics {
  hotspots: Array<{
    lat: number;
    lng: number;
    intensity: number;
  }>;
  popularRoutes: Array<{
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
    frequency: number;
  }>;
}

export interface FinancialMetrics {
  hourlyRevenue: number[];
  transactionCount: number;
  averageOrderValue: number;
  refundRate: number;
}

export interface RealTimeEvent {
  type: 'order' | 'delivery' | 'support' | 'user' | 'system';
  timestamp: number;
  data: any;
  priority: 'low' | 'medium' | 'high';
}

export interface AnalyticsFilter {
  timeRange: 'hour' | 'day' | 'week' | 'month';
  metrics: string[];
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
}

export interface AnalyticsDashboardConfig {
  refreshInterval: number;
  displayMetrics: string[];
  alertThresholds: {
    errorRate: number;
    responseTime: number;
    orderDelay: number;
  };
  visualizationPreferences: {
    chartType: 'line' | 'bar' | 'pie' | 'heatmap';
    colorScheme: string[];
    showLegend: boolean;
  };
}
