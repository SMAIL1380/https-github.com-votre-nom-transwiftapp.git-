export interface DeepLearningModel {
  id: string;
  name: string;
  type: 'CNN' | 'RNN' | 'LSTM' | 'Transformer';
  architecture: LayerConfig[];
  status: 'training' | 'ready' | 'error';
  performance: ModelPerformance;
  lastUpdated: Date;
}

export interface LayerConfig {
  type: string;
  units?: number;
  activation?: string;
  kernelSize?: number[];
  filters?: number;
  dropout?: number;
  inputShape?: number[];
}

export interface ModelPerformance {
  trainingLoss: number;
  validationLoss: number;
  trainingAccuracy: number;
  validationAccuracy: number;
  epochsCompleted: number;
  learningRate: number;
}

export interface TrainingConfig {
  batchSize: number;
  epochs: number;
  learningRate: number;
  validationSplit: number;
  optimizer: string;
  lossFunction: string;
  callbacks: CallbackConfig[];
}

export interface CallbackConfig {
  type: 'EarlyStopping' | 'ModelCheckpoint' | 'ReduceLROnPlateau';
  config: Record<string, any>;
}

export interface PredictionResult {
  output: number[] | number[][];
  confidence: number;
  processingTime: number;
  modelVersion: string;
}

export interface ModelMetadata {
  version: string;
  trainedOn: Date;
  datasetSize: number;
  parameters: number;
  memoryFootprint: number;
  averageInferenceTime: number;
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
  learningRate: number;
  timestamp: Date;
}

export interface DeepLearningFeatures {
  // Caractéristiques temporelles
  timeSequence: number[][];
  
  // Caractéristiques spatiales
  locationHeatmap: number[][];
  
  // Caractéristiques contextuelles
  weatherData: number[];
  trafficData: number[];
  eventData: number[];
  
  // Caractéristiques historiques
  pastPerformance: number[][];
  demandPatterns: number[][];
}
