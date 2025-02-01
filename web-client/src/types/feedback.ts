export interface ModelFeedback {
  id: string;
  modelId: string;
  timestamp: Date;
  type: 'prediction' | 'performance' | 'error' | 'suggestion';
  source: 'user' | 'system' | 'automated';
  severity: 'low' | 'medium' | 'high';
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'ignored';
}

export interface PredictionFeedback extends ModelFeedback {
  prediction: {
    input: Record<string, any>;
    expectedOutput: any;
    actualOutput: any;
    confidence: number;
  };
  impact: {
    metric: string;
    value: number;
    threshold: number;
  };
}

export interface PerformanceFeedback extends ModelFeedback {
  metrics: {
    name: string;
    current: number;
    baseline: number;
    threshold: number;
  }[];
  context: {
    environment: string;
    load: number;
    resourceUsage: {
      cpu: number;
      memory: number;
      gpu?: number;
    };
  };
}

export interface ErrorFeedback extends ModelFeedback {
  error: {
    type: string;
    message: string;
    stackTrace?: string;
    frequency: number;
  };
  impact: {
    usersAffected: number;
    failedRequests: number;
    downtime: number;
  };
}

export interface FeedbackAnalysis {
  id: string;
  feedbackIds: string[];
  timestamp: Date;
  patterns: {
    type: string;
    description: string;
    confidence: number;
    occurrences: number;
  }[];
  recommendations: {
    action: string;
    priority: 'low' | 'medium' | 'high';
    expectedImpact: number;
    effort: 'easy' | 'medium' | 'hard';
  }[];
  metrics: {
    name: string;
    trend: 'improving' | 'stable' | 'degrading';
    value: number;
    change: number;
  }[];
}

export interface FeedbackAction {
  id: string;
  feedbackId: string;
  type: 'retrain' | 'tune' | 'alert' | 'investigate' | 'deploy';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  deadline?: Date;
  progress: number;
  results?: {
    success: boolean;
    metrics: Record<string, number>;
    notes: string[];
  };
}

export interface AutomatedResponse {
  id: string;
  feedbackId: string;
  timestamp: Date;
  type: 'correction' | 'adaptation' | 'notification';
  actions: {
    type: string;
    description: string;
    status: 'pending' | 'executed' | 'failed';
    result?: any;
  }[];
  impact: {
    metric: string;
    before: number;
    after: number;
  }[];
}

export interface FeedbackMetrics {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    total: number;
    resolved: number;
    pending: number;
    critical: number;
  };
  categories: {
    [key: string]: {
      count: number;
      trend: number;
      avgResolutionTime: number;
    };
  };
  performance: {
    metric: string;
    value: number;
    change: number;
    target: number;
  }[];
}
