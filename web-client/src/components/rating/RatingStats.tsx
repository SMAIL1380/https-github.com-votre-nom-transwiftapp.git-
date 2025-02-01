'use client';

import { useEffect, useState } from 'react';
import {
  StarIcon,
  TrophyIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: Record<number, number>;
  recentTrend: 'up' | 'down' | 'stable';
  ranking: {
    position: number;
    total: number;
  };
  categoryAverages: {
    punctuality: number;
    professionalism: number;
    package_condition: number;
    communication: number;
  };
}

interface RatingStatsProps {
  driverId: string;
}

export default function RatingStats({ driverId }: RatingStatsProps) {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/drivers/${driverId}/rating-stats?timeframe=${timeframe}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

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

    fetchStats();
  }, [driverId, timeframe]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-600">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* En-tête avec note moyenne */}
      <div className="text-center mb-8">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {stats.averageRating.toFixed(1)}
        </div>
        <div className="flex justify-center mb-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <StarIconSolid
              key={value}
              className={`h-6 w-6 ${
                value <= stats.averageRating
                  ? 'text-yellow-400'
                  : 'text-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-gray-600">
          Basé sur {stats.totalRatings} évaluations
        </p>
      </div>

      {/* Sélecteur de période */}
      <div className="flex justify-center space-x-2 mb-8">
        {[
          { value: 'week', label: 'Semaine' },
          { value: 'month', label: 'Mois' },
          { value: 'year', label: 'Année' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTimeframe(value as typeof timeframe)}
            className={`px-4 py-2 rounded-md ${
              timeframe === value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grille de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribution des notes */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Distribution des notes
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.ratingDistribution)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([rating, count]) => {
                const percentage = (count / stats.totalRatings) * 100;
                return (
                  <div key={rating} className="flex items-center">
                    <span className="w-8 text-sm text-gray-600">{rating}★</span>
                    <div className="flex-1 mx-2">
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-12 text-sm text-gray-600">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Moyennes par catégorie */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Performance par catégorie
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.categoryAverages).map(([category, value]) => (
              <div key={category}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">
                    {category
                      .split('_')
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(' ')}
                  </span>
                  <span className="text-sm text-gray-600">
                    {value.toFixed(1)}/5
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-primary-600 rounded-full"
                    style={{ width: `${(value / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Classement */}
        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
          <TrophyIcon className="h-8 w-8 text-yellow-400 mr-4" />
          <div>
            <h3 className="font-medium text-gray-900">Classement</h3>
            <p className="text-gray-600">
              {stats.ranking.position}e sur {stats.ranking.total} livreurs
            </p>
          </div>
        </div>

        {/* Tendance */}
        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
          <ArrowTrendingUpIcon
            className={`h-8 w-8 mr-4 ${
              stats.recentTrend === 'up'
                ? 'text-green-500'
                : stats.recentTrend === 'down'
                ? 'text-red-500'
                : 'text-gray-400'
            }`}
          />
          <div>
            <h3 className="font-medium text-gray-900">Tendance récente</h3>
            <p className="text-gray-600">
              {stats.recentTrend === 'up'
                ? 'En progression'
                : stats.recentTrend === 'down'
                ? 'En baisse'
                : 'Stable'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
