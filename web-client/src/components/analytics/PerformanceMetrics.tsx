'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Metrics {
  deliveryTimes: {
    date: string;
    averageTime: number;
    predictedTime: number;
  }[];
  efficiency: {
    onTimeDeliveries: number;
    totalDeliveries: number;
    averageDelay: number;
    improvementRate: number;
  };
  suggestions: {
    type: 'route' | 'timing' | 'behavior';
    description: string;
    impact: number;
  }[];
}

interface PerformanceMetricsProps {
  driverId: string;
}

export default function PerformanceMetrics({ driverId }: PerformanceMetricsProps) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/drivers/${driverId}/metrics?timeframe=${timeframe}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des métriques');
        }

        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [driverId, timeframe]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center text-gray-600">
        Aucune donnée disponible
      </div>
    );
  }

  const chartData = {
    labels: metrics.deliveryTimes.map((item) =>
      format(new Date(item.date), 'd MMM', { locale: fr })
    ),
    datasets: [
      {
        label: 'Temps réel',
        data: metrics.deliveryTimes.map((item) => item.averageTime),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Temps prédit',
        data: metrics.deliveryTimes.map((item) => item.predictedTime),
        borderColor: 'rgb(99, 102, 241)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Temps de livraison vs Prédictions',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Minutes',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Sélecteur de période */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              timeframe === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Semaine
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              timeframe === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Mois
          </button>
        </div>
      </div>

      {/* Graphique */}
      <div className="h-[300px] mb-8">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Métriques d'efficacité */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800">
            Livraisons à l'heure
          </h4>
          <p className="text-2xl font-bold text-green-600">
            {Math.round((metrics.efficiency.onTimeDeliveries / metrics.efficiency.totalDeliveries) * 100)}%
          </p>
          <p className="text-sm text-green-700 mt-1">
            {metrics.efficiency.onTimeDeliveries} sur {metrics.efficiency.totalDeliveries} livraisons
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800">
            Retard moyen
          </h4>
          <p className="text-2xl font-bold text-blue-600">
            {metrics.efficiency.averageDelay} min
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Sur toutes les livraisons
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-800">
            Taux d'amélioration
          </h4>
          <p className="text-2xl font-bold text-purple-600">
            {metrics.efficiency.improvementRate > 0 ? '+' : ''}
            {metrics.efficiency.improvementRate}%
          </p>
          <p className="text-sm text-purple-700 mt-1">
            Par rapport à la période précédente
          </p>
        </div>
      </div>

      {/* Suggestions d'amélioration */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Suggestions d'amélioration
        </h3>
        <div className="space-y-4">
          {metrics.suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4 flex items-start space-x-4"
            >
              <div className={`p-2 rounded-full ${
                suggestion.type === 'route'
                  ? 'bg-blue-100 text-blue-600'
                  : suggestion.type === 'timing'
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-green-100 text-green-600'
              }`}>
                {suggestion.type === 'route' ? '🛣️' :
                 suggestion.type === 'timing' ? '⏰' : '👤'}
              </div>
              <div className="flex-1">
                <p className="text-gray-900">{suggestion.description}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Impact potentiel: {suggestion.impact}% d'amélioration
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
