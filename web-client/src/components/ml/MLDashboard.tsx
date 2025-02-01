import React, { useState, useEffect } from 'react';
import { mlService } from '../../services/MLService';
import {
  MLModelMetrics,
  DemandPrediction,
  DriverPerformancePrediction
} from '../../types/mlModels';
import './MLDashboard.css';

const MLDashboard: React.FC = () => {
  const [modelMetrics, setModelMetrics] = useState<Record<string, MLModelMetrics>>({});
  const [demandPrediction, setDemandPrediction] = useState<DemandPrediction | null>(null);
  const [driverPrediction, setDriverPrediction] = useState<DriverPerformancePrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('demand');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Charger les métriques pour tous les modèles
      const models = ['demand', 'route', 'driver', 'customer'];
      const metricsPromises = models.map(model => mlService.getModelMetrics(model));
      const metricsResults = await Promise.all(metricsPromises);
      
      const metricsMap: Record<string, MLModelMetrics> = {};
      models.forEach((model, index) => {
        metricsMap[model] = metricsResults[index];
      });
      setModelMetrics(metricsMap);

      // Charger les prédictions actuelles
      const currentFeatures = generateCurrentFeatures();
      const demand = await mlService.predictDemand(currentFeatures);
      setDemandPrediction(demand);

      const driverPerf = await mlService.predictDriverPerformance(
        'current-driver-id',
        { start: new Date(), end: new Date(Date.now() + 24 * 60 * 60 * 1000) }
      );
      setDriverPrediction(driverPerf);

      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données ML');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateCurrentFeatures = () => ({
    timestamp: Date.now(),
    dayOfWeek: new Date().getDay(),
    hourOfDay: new Date().getHours(),
    isWeekend: [0, 6].includes(new Date().getDay()),
    isHoliday: false, // À implémenter avec un service de calendrier
    weatherCondition: 'clear',
    temperature: 20,
    precipitation: 0,
    trafficLevel: 2,
    nearbyEvents: 0,
    historicalDemand: [10, 12, 15, 11, 13],
    activeDrivers: 25
  });

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
  };

  const renderMetricsCard = (metrics: MLModelMetrics) => (
    <div className="metrics-card">
      <h3>{metrics.modelName}</h3>
      <div className="metrics-grid">
        <div className="metric">
          <span className="label">Précision</span>
          <span className="value">{(metrics.precision * 100).toFixed(1)}%</span>
        </div>
        <div className="metric">
          <span className="label">Rappel</span>
          <span className="value">{(metrics.recall * 100).toFixed(1)}%</span>
        </div>
        <div className="metric">
          <span className="label">Score F1</span>
          <span className="value">{(metrics.f1Score * 100).toFixed(1)}%</span>
        </div>
      </div>
      <div className="last-training">
        Dernier entraînement: {new Date(metrics.lastTrainingDate).toLocaleDateString()}
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading-state">Chargement des données ML...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="ml-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Machine Learning</h1>
        <button onClick={loadDashboardData} className="refresh-button">
          Rafraîchir
        </button>
      </div>

      <div className="model-selector">
        {Object.keys(modelMetrics).map(model => (
          <button
            key={model}
            className={`model-button ${selectedModel === model ? 'active' : ''}`}
            onClick={() => handleModelSelect(model)}
          >
            {model.charAt(0).toUpperCase() + model.slice(1)}
          </button>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Métriques du modèle */}
        <div className="section metrics-section">
          <h2>Métriques des Modèles</h2>
          <div className="metrics-container">
            {Object.values(modelMetrics).map(metrics => (
              <div key={metrics.modelName}>
                {renderMetricsCard(metrics)}
              </div>
            ))}
          </div>
        </div>

        {/* Prédictions actuelles */}
        {demandPrediction && (
          <div className="section predictions-section">
            <h2>Prédictions Actuelles</h2>
            <div className="prediction-card">
              <h3>Demande</h3>
              <div className="prediction-value">
                {demandPrediction.predictedDemand.toFixed(0)} commandes
                <span className="confidence">
                  ({(demandPrediction.confidence * 100).toFixed(1)}% confiance)
                </span>
              </div>
              <div className="factors-list">
                {demandPrediction.factors.map((factor, index) => (
                  <div key={index} className="factor">
                    <span className="factor-name">{factor.name}</span>
                    <span className="factor-impact">
                      Impact: {factor.impact > 0 ? '+' : ''}{factor.impact}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Prédictions de performance */}
        {driverPrediction && (
          <div className="section performance-section">
            <h2>Prédictions de Performance</h2>
            <div className="performance-card">
              <div className="performance-metrics">
                <div className="metric">
                  <span className="label">Livraisons</span>
                  <span className="value">{driverPrediction.predictedDeliveries}</span>
                  <span className="confidence">
                    {(driverPrediction.confidenceScores.deliveries * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="metric">
                  <span className="label">Gains</span>
                  <span className="value">{driverPrediction.predictedEarnings}€</span>
                  <span className="confidence">
                    {(driverPrediction.confidenceScores.earnings * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="metric">
                  <span className="label">Note</span>
                  <span className="value">{driverPrediction.predictedRating.toFixed(1)}</span>
                  <span className="confidence">
                    {(driverPrediction.confidenceScores.rating * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="suggestions-list">
                {driverPrediction.suggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion">
                    <span className="type">{suggestion.type}</span>
                    <p>{suggestion.description}</p>
                    <span className="improvement">
                      +{suggestion.expectedImprovement}% d'amélioration
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MLDashboard;
