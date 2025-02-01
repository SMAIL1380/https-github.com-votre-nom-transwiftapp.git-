import React, { useState, useEffect } from 'react';
import { feedbackService } from '../../services/FeedbackService';
import {
  ModelFeedback,
  FeedbackAnalysis,
  FeedbackAction,
  FeedbackMetrics
} from '../../types/feedback';
import './FeedbackDashboard.css';

const FeedbackDashboard: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<ModelFeedback[]>([]);
  const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null);
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);
  const [actions, setActions] = useState<FeedbackAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const modelId = 'current-model-id'; // À remplacer par l'ID du modèle actuel
      const period = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 derniers jours
        end: new Date()
      };

      // Charger les métriques
      const metricsData = await feedbackService.getFeedbackMetrics(modelId, period);
      setMetrics(metricsData);

      // Charger l'analyse
      const analysisData = await feedbackService.analyzeFeedback(modelId, period);
      setAnalysis(analysisData);

      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderMetricsSummary = (metrics: FeedbackMetrics) => (
    <div className="metrics-summary">
      <h3>Résumé des Métriques</h3>
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total Feedback</span>
          <span className="metric-value">{metrics.summary.total}</span>
          <div className="metric-details">
            <div className="detail-item">
              <span className="label">Résolus</span>
              <span className="value">{metrics.summary.resolved}</span>
            </div>
            <div className="detail-item">
              <span className="label">En attente</span>
              <span className="value">{metrics.summary.pending}</span>
            </div>
            <div className="detail-item">
              <span className="label">Critiques</span>
              <span className="value">{metrics.summary.critical}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceMetrics = (metrics: FeedbackMetrics) => (
    <div className="performance-metrics">
      <h3>Métriques de Performance</h3>
      <div className="metrics-grid">
        {metrics.performance.map((metric, index) => (
          <div key={index} className="metric-card">
            <span className="metric-label">{metric.metric}</span>
            <span className="metric-value">{metric.value.toFixed(2)}</span>
            <div className={`metric-change ${metric.change > 0 ? 'positive' : 'negative'}`}>
              {metric.change > 0 ? '+' : ''}{metric.change.toFixed(2)}%
            </div>
            <div className="metric-target">
              Objectif: {metric.target.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalysisPatterns = (analysis: FeedbackAnalysis) => (
    <div className="analysis-patterns">
      <h3>Patterns Détectés</h3>
      <div className="patterns-list">
        {analysis.patterns.map((pattern, index) => (
          <div key={index} className="pattern-card">
            <div className="pattern-header">
              <span className="pattern-type">{pattern.type}</span>
              <span className="pattern-confidence">
                {(pattern.confidence * 100).toFixed(1)}% confiance
              </span>
            </div>
            <p className="pattern-description">{pattern.description}</p>
            <div className="pattern-stats">
              <span className="occurrences">
                {pattern.occurrences} occurrences
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRecommendations = (analysis: FeedbackAnalysis) => (
    <div className="recommendations">
      <h3>Recommandations</h3>
      <div className="recommendations-list">
        {analysis.recommendations.map((rec, index) => (
          <div key={index} className={`recommendation-card priority-${rec.priority}`}>
            <div className="recommendation-header">
              <span className="priority">{rec.priority}</span>
              <span className="effort">{rec.effort}</span>
            </div>
            <p className="action">{rec.action}</p>
            <div className="impact">
              Impact attendu: {rec.expectedImpact.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading-state">Chargement du dashboard de feedback...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="feedback-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard de Feedback</h1>
        <button onClick={loadDashboardData} className="refresh-button">
          Rafraîchir
        </button>
      </div>

      <div className="dashboard-content">
        {/* Métriques */}
        {metrics && (
          <>
            {renderMetricsSummary(metrics)}
            {renderPerformanceMetrics(metrics)}
          </>
        )}

        {/* Analyse */}
        {analysis && (
          <>
            {renderAnalysisPatterns(analysis)}
            {renderRecommendations(analysis)}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackDashboard;
