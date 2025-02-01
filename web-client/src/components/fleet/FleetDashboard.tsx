'use client';

import { useState, useEffect } from 'react';
import {
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

interface FleetStats {
  totalDrivers: number;
  activeDrivers: number;
  totalDeliveries: number;
  completedDeliveries: number;
  averageRating: number;
  performanceHistory: {
    date: string;
    deliveries: number;
    rating: number;
  }[];
  driverStatus: {
    available: number;
    busy: number;
    offline: number;
  };
  alerts: {
    id: string;
    type: 'warning' | 'error';
    message: string;
    timestamp: string;
  }[];
}

export default function FleetDashboard() {
  const [stats, setStats] = useState<FleetStats | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFleetStats();
  }, [timeframe]);

  const fetchFleetStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/fleet/stats?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  const statusChartData = {
    labels: ['Disponible', 'Occupé', 'Hors ligne'],
    datasets: [
      {
        data: [
          stats.driverStatus.available,
          stats.driverStatus.busy,
          stats.driverStatus.offline,
        ],
        backgroundColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(107, 114, 128)',
        ],
      },
    ],
  };

  const performanceChartData = {
    labels: stats.performanceHistory.map((item) =>
      format(new Date(item.date), 'd MMM', { locale: fr })
    ),
    datasets: [
      {
        label: 'Livraisons',
        data: stats.performanceHistory.map((item) => item.deliveries),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Note moyenne',
        data: stats.performanceHistory.map((item) => item.rating),
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Tableau de Bord Flotte
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeframe('day')}
            className={`px-3 py-1 rounded-md ${
              timeframe === 'day'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Jour
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1 rounded-md ${
              timeframe === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 rounded-md ${
              timeframe === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Mois
          </button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartPieIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Chauffeurs actifs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.activeDrivers}/{stats.totalDrivers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Livraisons complétées</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.completedDeliveries}/{stats.totalDeliveries}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ChartPieIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Note moyenne</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.averageRating.toFixed(1)} ⭐
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Alertes actives</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.alerts.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Statut des chauffeurs
          </h3>
          <div className="h-64">
            <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Performance de la flotte
          </h3>
          <div className="h-64">
            <Line
              data={performanceChartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Alertes */}
      {stats.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              Alertes actives
            </h3>
          </div>
          <div className="divide-y">
            {stats.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 ${
                  alert.type === 'error'
                    ? 'bg-red-50'
                    : 'bg-yellow-50'
                }`}
              >
                <div className="flex items-center">
                  <ExclamationTriangleIcon
                    className={`w-5 h-5 mr-3 ${
                      alert.type === 'error'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}
                  />
                  <div>
                    <p className={`text-sm font-medium ${
                      alert.type === 'error'
                        ? 'text-red-800'
                        : 'text-yellow-800'
                    }`}>
                      {alert.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(alert.timestamp), 'PPp', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
