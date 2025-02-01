export interface HyperParameter {
  name: string;
  type: 'continuous' | 'discrete' | 'categorical';
  range?: [number, number];
  choices?: any[];
  currentValue: any;
  importance: number;
  description: string;
}

export interface OptimizationConfig {
  method: 'grid_search' | 'random_search' | 'bayesian' | 'evolutionary';
  maxTrials: number;
  maxParallel: number;
  targetMetric: string;
  direction: 'minimize' | 'maximize';
  earlyStoppingRounds: number;
}

export interface OptimizationTrial {
  id: string;
  parameters: Record<string, any>;
  metrics: {
    value: number;
    timestamp: Date;
    epoch: number;
  }[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  error?: string;
}

export interface OptimizationResult {
  bestParameters: Record<string, any>;
  bestMetrics: Record<string, number>;
  allTrials: OptimizationTrial[];
  convergenceHistory: {
    trial: number;
    bestValue: number;
    timestamp: Date;
  }[];
  duration: number;
  status: 'completed' | 'stopped' | 'failed';
}

export interface ParameterImportance {
  parameter: string;
  importance: number;
  correlations: {
    metric: string;
    correlation: number;
  }[];
}

export interface OptimizationSpace {
  parameters: HyperParameter[];
  constraints: {
    type: 'sum' | 'product' | 'dependency';
    parameters: string[];
    condition: string;
  }[];
  dependencies: {
    parameter: string;
    dependsOn: string;
    condition: string;
  }[];
}

export interface OptimizationStrategy {
  name: string;
  config: {
    explorationRate: number;
    exploitationRate: number;
    adaptiveLearning: boolean;
    parallelization: {
      enabled: boolean;
      maxWorkers: number;
    };
  };
  schedulers: {
    type: 'learning_rate' | 'population_size' | 'mutation_rate';
    schedule: Record<number, number>;
  }[];
}
