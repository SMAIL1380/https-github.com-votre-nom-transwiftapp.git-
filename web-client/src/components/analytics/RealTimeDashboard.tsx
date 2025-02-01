import React, { useEffect, useState, useCallback } from 'react';
import {
  RealTimeMetrics,
  PerformanceMetrics,
  UserActivityMetrics,
  LocationMetrics,
  FinancialMetrics,
} from '../../types/analytics';
import { analyticsService } from '../../services/AnalyticsService';
import MetricsCard from './MetricsCard';
import PerformanceChart from './PerformanceChart';
import LocationHeatmap from './LocationHeatmap';
import EventStream from './EventStream';
import './RealTimeDashboard.css';

const RealTimeDashboard: React.FC = () => {
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivityMetrics | null>(null);
  const [locationData, setLocationData] = useState<LocationMetrics | null>(null);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);

  const handleMetricsUpdate = useCallback((data: RealTimeMetrics) => {
    setRealTimeMetrics(data);
  }, []);

  const handlePerformanceUpdate = useCallback((data: PerformanceMetrics) => {
    setPerformanceMetrics(data);
  }, []);

  const handleUserActivityUpdate = useCallback((data: UserActivityMetrics) => {
    setUserActivity(data);
  }, []);

  const handleLocationUpdate = useCallback((data: LocationMetrics) => {
    setLocationData(data);
  }, []);

  const handleFinancialUpdate = useCallback((data: FinancialMetrics) => {
    setFinancialMetrics(data);
  }, []);

  useEffect(() => {
    // Souscrire aux mises à jour en temps réel
    const unsubscribeMetrics = analyticsService.subscribeToMetrics(
      'metrics_update',
      handleMetricsUpdate
    );
    const unsubscribePerformance = analyticsService.subscribeToMetrics(
      'performance_update',
      handlePerformanceUpdate
    );
    const unsubscribeUserActivity = analyticsService.subscribeToMetrics(
      'user_activity',
      handleUserActivityUpdate
    );
    const unsubscribeLocation = analyticsService.subscribeToMetrics(
      'location_update',
      handleLocationUpdate
    );
    const unsubscribeFinancial = analyticsService.subscribeToMetrics(
      'financial_update',
      handleFinancialUpdate
    );

    // Configurer les alertes
    analyticsService.setAlertThreshold('errorRate', 5, (data) => {
      console.warn('Taux d\'erreur élevé détecté:', data);
      // Afficher une notification
    });

    analyticsService.setAlertThreshold('responseTime', 1000, (data) => {
      console.warn('Temps de réponse élevé détecté:', data);
      // Afficher une notification
    });

    return () => {
      // Nettoyer les souscriptions
      unsubscribeMetrics();
      unsubscribePerformance();
      unsubscribeUserActivity();
      unsubscribeLocation();
      unsubscribeFinancial();
    };
  }, [
    handleMetricsUpdate,
    handlePerformanceUpdate,
    handleUserActivityUpdate,
    handleLocationUpdate,
    handleFinancialUpdate,
  ]);

  const handleExportReport = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Dernières 24h
      const metrics = ['realtime', 'performance', 'userActivity', 'location', 'financial'];
      
      const report = await analyticsService.generateReport(startDate, endDate, metrics);
      const url = URL.createObjectURL(report);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analytics-report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export du rapport:', error);
    }
  };

  return (
    <div className="real-time-dashboard">
      <div className="dashboard-header">
        <h1>Tableau de Bord en Temps Réel</h1>
        <button onClick={handleExportReport} className="export-button">
          Exporter le Rapport
        </button>
      </div>

      <div className="metrics-grid">
        {realTimeMetrics && (
          <MetricsCard
            title="Métriques en Temps Réel"
            metrics={[
              { label: 'Utilisateurs Actifs', value: realTimeMetrics.activeUsers },
              { label: 'Chauffeurs en Ligne', value: realTimeMetrics.onlineDrivers },
              { label: 'Livraisons en Cours', value: realTimeMetrics.currentDeliveries },
              { label: 'Commandes en Attente', value: realTimeMetrics.pendingOrders },
            ]}
          />
        )}

        {performanceMetrics && (
          <PerformanceChart
            data={performanceMetrics}
            historicalData={analyticsService.getBufferedMetrics('performance')}
          />
        )}

        {locationData && (
          <LocationHeatmap
            hotspots={locationData.hotspots}
            popularRoutes={locationData.popularRoutes}
          />
        )}

        {userActivity && (
          <MetricsCard
            title="Activité Utilisateurs"
            metrics={[
              { label: 'Nouveaux Utilisateurs', value: userActivity.newUsers },
              { label: 'Chats Actifs', value: userActivity.activeChats },
              { label: 'Tickets Support', value: userActivity.supportTickets },
              { label: 'Durée Session Moy.', value: `${userActivity.averageSessionDuration}m` },
            ]}
          />
        )}

        {financialMetrics && (
          <MetricsCard
            title="Métriques Financières"
            metrics={[
              { label: 'Revenu Horaire', value: `${financialMetrics.hourlyRevenue[financialMetrics.hourlyRevenue.length - 1]}€` },
              { label: 'Transactions', value: financialMetrics.transactionCount },
              { label: 'Valeur Moy. Commande', value: `${financialMetrics.averageOrderValue}€` },
              { label: 'Taux de Remboursement', value: `${financialMetrics.refundRate}%` },
            ]}
          />
        )}
      </div>

      <EventStream />
    </div>
  );
};

export default RealTimeDashboard;
