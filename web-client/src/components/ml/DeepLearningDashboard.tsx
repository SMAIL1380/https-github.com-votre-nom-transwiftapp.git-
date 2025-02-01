import React, { useState, useEffect } from 'react';
import { deepLearningService } from '../../services/DeepLearningService';
import {
  DeepLearningModel,
  TrainingMetrics,
  ModelMetadata,
  PredictionResult
} from '../../types/deepLearning';
import './DeepLearningDashboard.css';

const DeepLearningDashboard: React.FC = () => {
  const [models, setModels] = useState<DeepLearningModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics[]>([]);
  const [modelMetadata, setModelMetadata] = useState<ModelMetadata | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      loadModelDetails(selectedModel);
    }
  }, [selectedModel]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Charger la liste des modèles (à implémenter dans le service)
      const response = await fetch('/api/deep-learning/models');
      const modelsList = await response.json();
      setModels(modelsList);
      
      if (modelsList.length > 0) {
        setSelectedModel(modelsList[0].id);
      }
      
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadModelDetails = async (modelId: string) => {
    try {
      setLoading(true);
      
      // Charger les métadonnées du modèle
      const metadata = await deepLearningService.getModelMetadata(modelId);
      setModelMetadata(metadata);

      // Charger l'historique d'entraînement
      const history = await deepLearningService.getTrainingHistory(modelId, 'latest');
      setTrainingMetrics(history);

      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des détails du modèle');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderModelCard = (model: DeepLearningModel) => (
    <div
      className={`model-card ${selectedModel === model.id ? 'selected' : ''}`}
      onClick={() => setSelectedModel(model.id)}
    >
      <div className="model-header">
        <h3>{model.name}</h3>
        <span className={`status ${model.status}`}>{model.status}</span>
      </div>
      <div className="model-info">
        <div className="info-item">
          <span className="label">Type</span>
          <span className="value">{model.type}</span>
        </div>
        <div className="info-item">
          <span className="label">Précision</span>
          <span className="value">
            {(model.performance.validationAccuracy * 100).toFixed(1)}%
          </span>
        </div>
        <div className="info-item">
          <span className="label">Dernière mise à jour</span>
          <span className="value">
            {new Date(model.lastUpdated).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  const renderTrainingMetrics = (metrics: TrainingMetrics[]) => (
    <div className="training-metrics">
      <h3>Métriques d'Entraînement</h3>
      <div className="metrics-chart">
        {/* Ici, vous pouvez intégrer une bibliothèque de graphiques comme Chart.js */}
        <div className="metrics-table">
          <table>
            <thead>
              <tr>
                <th>Époque</th>
                <th>Perte</th>
                <th>Précision</th>
                <th>Perte Val.</th>
                <th>Précision Val.</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => (
                <tr key={metric.epoch}>
                  <td>{metric.epoch}</td>
                  <td>{metric.loss.toFixed(4)}</td>
                  <td>{(metric.accuracy * 100).toFixed(1)}%</td>
                  <td>{metric.valLoss.toFixed(4)}</td>
                  <td>{(metric.valAccuracy * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderModelMetadata = (metadata: ModelMetadata) => (
    <div className="model-metadata">
      <h3>Métadonnées du Modèle</h3>
      <div className="metadata-grid">
        <div className="metadata-item">
          <span className="label">Version</span>
          <span className="value">{metadata.version}</span>
        </div>
        <div className="metadata-item">
          <span className="label">Taille du dataset</span>
          <span className="value">{metadata.datasetSize.toLocaleString()}</span>
        </div>
        <div className="metadata-item">
          <span className="label">Paramètres</span>
          <span className="value">{metadata.parameters.toLocaleString()}</span>
        </div>
        <div className="metadata-item">
          <span className="label">Empreinte mémoire</span>
          <span className="value">{(metadata.memoryFootprint / 1024 / 1024).toFixed(2)} MB</span>
        </div>
        <div className="metadata-item">
          <span className="label">Temps d'inférence moyen</span>
          <span className="value">{metadata.averageInferenceTime.toFixed(2)} ms</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading-state">Chargement du dashboard Deep Learning...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="deep-learning-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Deep Learning</h1>
        <button onClick={loadDashboardData} className="refresh-button">
          Rafraîchir
        </button>
      </div>

      <div className="dashboard-content">
        {/* Liste des modèles */}
        <div className="models-list">
          <h2>Modèles Disponibles</h2>
          <div className="models-grid">
            {models.map((model) => renderModelCard(model))}
          </div>
        </div>

        {/* Détails du modèle sélectionné */}
        {selectedModel && modelMetadata && (
          <div className="model-details">
            {renderModelMetadata(modelMetadata)}
            {trainingMetrics.length > 0 && renderTrainingMetrics(trainingMetrics)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeepLearningDashboard;
