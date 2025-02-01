import React, { useState, useEffect } from 'react';
import { hyperParameterService } from '../../services/HyperParameterService';
import {
  OptimizationTrial,
  OptimizationResult,
  ParameterImportance,
  HyperParameter
} from '../../types/hyperparameters';
import './HyperParameterDashboard.css';

const HyperParameterDashboard: React.FC = () => {
  const [activeOptimization, setActiveOptimization] = useState<string | null>(null);
  const [optimizationStatus, setOptimizationStatus] = useState<{
    status: string;
    progress: number;
    currentBest: OptimizationResult;
    activeTrials: OptimizationTrial[];
  } | null>(null);
  const [parameterImportance, setParameterImportance] = useState<ParameterImportance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeOptimization) {
      const interval = setInterval(updateOptimizationStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [activeOptimization]);

  const updateOptimizationStatus = async () => {
    if (!activeOptimization) return;

    try {
      const status = await hyperParameterService.getOptimizationStatus(activeOptimization);
      setOptimizationStatus(status);

      if (status.status === 'completed') {
        const analysis = await hyperParameterService.analyzeResults(activeOptimization);
        setParameterImportance(analysis.parameterImportance);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
    }
  };

  const renderTrialCard = (trial: OptimizationTrial) => (
    <div className={`trial-card ${trial.status}`} key={trial.id}>
      <div className="trial-header">
        <span className="trial-id">Essai #{trial.id}</span>
        <span className={`trial-status ${trial.status}`}>{trial.status}</span>
      </div>
      <div className="trial-params">
        {Object.entries(trial.parameters).map(([key, value]) => (
          <div className="param-item" key={key}>
            <span className="param-name">{key}</span>
            <span className="param-value">{value}</span>
          </div>
        ))}
      </div>
      <div className="trial-metrics">
        {trial.metrics.map((metric, index) => (
          <div className="metric-item" key={index}>
            <span className="metric-value">{metric.value.toFixed(4)}</span>
            <span className="metric-epoch">Époque {metric.epoch}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderParameterImportance = (params: ParameterImportance[]) => (
    <div className="parameter-importance">
      <h3>Importance des Paramètres</h3>
      <div className="importance-bars">
        {params.sort((a, b) => b.importance - a.importance).map((param) => (
          <div className="importance-item" key={param.parameter}>
            <div className="importance-header">
              <span className="param-name">{param.parameter}</span>
              <span className="importance-value">
                {(param.importance * 100).toFixed(1)}%
              </span>
            </div>
            <div className="importance-bar-container">
              <div
                className="importance-bar"
                style={{ width: `${param.importance * 100}%` }}
              />
            </div>
            <div className="correlations">
              {param.correlations.map((corr) => (
                <div className="correlation-item" key={corr.metric}>
                  <span className="metric-name">{corr.metric}</span>
                  <span className="correlation-value">
                    {(corr.correlation * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOptimizationProgress = () => {
    if (!optimizationStatus) return null;

    return (
      <div className="optimization-progress">
        <div className="progress-header">
          <h3>Progression de l'Optimisation</h3>
          <span className="progress-percentage">
            {(optimizationStatus.progress * 100).toFixed(1)}%
          </span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{ width: `${optimizationStatus.progress * 100}%` }}
          />
        </div>
        <div className="status-details">
          <div className="status-item">
            <span className="label">Status</span>
            <span className={`value ${optimizationStatus.status}`}>
              {optimizationStatus.status}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Meilleure valeur</span>
            <span className="value">
              {optimizationStatus.currentBest?.bestMetrics?.value?.toFixed(4)}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Essais terminés</span>
            <span className="value">
              {optimizationStatus.currentBest?.allTrials?.length || 0}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading-state">Chargement de l'optimisation...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="hyperparameter-dashboard">
      <div className="dashboard-header">
        <h1>Optimisation des Hyperparamètres</h1>
        <div className="header-actions">
          <button
            onClick={updateOptimizationStatus}
            className="refresh-button"
            disabled={!activeOptimization}
          >
            Rafraîchir
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Progression de l'optimisation */}
        {renderOptimizationProgress()}

        {/* Essais actifs */}
        <div className="active-trials">
          <h3>Essais en Cours</h3>
          <div className="trials-grid">
            {optimizationStatus?.activeTrials.map(renderTrialCard)}
          </div>
        </div>

        {/* Importance des paramètres */}
        {parameterImportance.length > 0 && renderParameterImportance(parameterImportance)}

        {/* Meilleurs résultats */}
        {optimizationStatus?.currentBest && (
          <div className="best-results">
            <h3>Meilleurs Résultats</h3>
            <div className="best-parameters">
              {Object.entries(optimizationStatus.currentBest.bestParameters).map(
                ([key, value]) => (
                  <div className="best-param-item" key={key}>
                    <span className="param-name">{key}</span>
                    <span className="param-value">{value}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HyperParameterDashboard;
