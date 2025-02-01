import React, { useState, useEffect } from 'react';
import { predictionService } from '../../services/PredictionService';
import {
  DeliveryPrediction,
  HotspotPrediction,
  PredictionFactors,
  OptimizationSuggestion
} from '../../types/predictions';
import './PredictionDashboard.css';

const PredictionDashboard: React.FC = () => {
  const [deliveryPredictions, setDeliveryPredictions] = useState<DeliveryPrediction[]>([]);
  const [hotspots, setHotspots] = useState<HotspotPrediction[]>([]);
  const [factors, setFactors] = useState<PredictionFactors | null>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      
      // Charger les prédictions pour la journée
      const area = {
        lat: 48.8566, // Paris
        lng: 2.3522,
        radius: 10000 // 10km
      };

      const today = new Date();
      const predictions = await predictionService.getDeliveryPredictions(today, area);
      setDeliveryPredictions(predictions);

      // Charger les hotspots actuels
      const currentHour = `${today.getHours()}:00`;
      const currentHotspots = await predictionService.getHotspots(currentHour, area);
      setHotspots(currentHotspots);

      // Charger les facteurs de prédiction
      const predictionFactors = await predictionService.getPredictionFactors(today);
      setFactors(predictionFactors);

      // Charger les suggestions d'optimisation
      const timeRange = {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
      const optimizationSuggestions = await predictionService.getOptimizationSuggestions(
        'current-driver-id',
        timeRange
      );
      setSuggestions(optimizationSuggestions);

      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des prédictions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderDemandLevel = (level: 'low' | 'medium' | 'high') => {
    const colors = {
      low: '#34D399',
      medium: '#FBBF24',
      high: '#EF4444'
    };
    return (
      <span
        className="demand-indicator"
        style={{ backgroundColor: colors[level] }}
      >
        {level === 'low' ? 'Faible' : level === 'medium' ? 'Moyen' : 'Élevé'}
      </span>
    );
  };

  if (loading) {
    return <div className="loading-state">Chargement des prédictions...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="prediction-dashboard">
      <div className="dashboard-header">
        <h1>Prédictions et Analyses</h1>
        <button onClick={loadPredictions} className="refresh-button">
          Rafraîchir
        </button>
      </div>

      <div className="predictions-grid">
        {/* Prédictions de livraison */}
        <div className="prediction-card delivery-predictions">
          <h2>Prédictions de Demande</h2>
          <div className="time-slots">
            {deliveryPredictions.map((prediction, index) => (
              <div key={index} className="time-slot">
                <div className="time">{prediction.timeSlot}</div>
                <div className="demand">
                  {renderDemandLevel(prediction.demandLevel)}
                </div>
                <div className="orders">
                  {prediction.predictedOrders} commandes prévues
                </div>
                <div className="confidence">
                  Confiance: {(prediction.confidence * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facteurs d'influence */}
        {factors && (
          <div className="prediction-card factors">
            <h2>Facteurs d'Influence</h2>
            <div className="weather-impact">
              <h3>Météo</h3>
              <div className={`impact ${factors.weather.impact}`}>
                {factors.weather.condition}
                <span className="impact-value">
                  {factors.weather.impact === 'positive' ? '+' : ''}
                  {factors.weather.intensityPercent}%
                </span>
              </div>
            </div>
            <div className="events-impact">
              <h3>Événements</h3>
              {factors.events.map((event, index) => (
                <div key={index} className="event">
                  <span className="event-name">{event.name}</span>
                  <span className="event-impact">
                    Impact: {event.impact > 0 ? '+' : ''}{event.impact}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions d'optimisation */}
        <div className="prediction-card suggestions">
          <h2>Suggestions d'Optimisation</h2>
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`suggestion-item priority-${suggestion.priority}`}
              >
                <div className="suggestion-header">
                  <span className="suggestion-type">{suggestion.type}</span>
                  <span className="suggestion-priority">{suggestion.priority}</span>
                </div>
                <p>{suggestion.description}</p>
                <div className="suggestion-impact">
                  <span className="impact-label">Impact attendu:</span>
                  <span className="impact-value">
                    +{suggestion.expectedImpact.improvement}% {suggestion.expectedImpact.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carte des hotspots */}
        <div className="prediction-card hotspots">
          <h2>Zones à Forte Demande</h2>
          <div className="hotspots-list">
            {hotspots.map((hotspot, index) => (
              <div key={index} className="hotspot-item">
                <div className="hotspot-type">{hotspot.type}</div>
                <div className="hotspot-intensity">
                  Intensité: {(hotspot.intensity * 100).toFixed(0)}%
                </div>
                <div className="hotspot-duration">
                  Durée prévue: {hotspot.predictedDuration} min
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionDashboard;
