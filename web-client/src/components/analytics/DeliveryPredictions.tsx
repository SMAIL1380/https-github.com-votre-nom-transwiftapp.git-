'use client';

import { useEffect, useState } from 'react';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

interface Prediction {
  deliveryId: string;
  estimatedDelay: number;
  confidence: number;
  factors: {
    traffic: number;
    weather: number;
    distance: number;
    timeOfDay: number;
    historicalData: number;
  };
  alternativeRoutes: {
    route: string;
    estimatedTime: number;
    trafficLevel: 'low' | 'medium' | 'high';
  }[];
  weatherConditions: {
    condition: string;
    impact: 'low' | 'medium' | 'high';
  };
}

interface DeliveryPredictionsProps {
  deliveryId: string;
  currentLocation: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
}

export default function DeliveryPredictions({
  deliveryId,
  currentLocation,
  destination,
}: DeliveryPredictionsProps) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(0);

  useEffect(() => {
    const fetchPredictions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            deliveryId,
            currentLocation,
            destination,
          }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des prédictions');
        }

        const data = await response.json();
        setPrediction(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
    // Rafraîchir les prédictions toutes les 5 minutes
    const interval = setInterval(fetchPredictions, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [deliveryId, currentLocation, destination]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="text-center text-gray-600">
        Impossible de charger les prédictions
      </div>
    );
  }

  const getDelayColor = (delay: number) => {
    if (delay <= 5) return 'text-green-600';
    if (delay <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prédiction principale */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Prédiction de retard
          </h3>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className={`text-3xl font-bold ${getDelayColor(prediction.estimatedDelay)}`}>
                {prediction.estimatedDelay} min
              </p>
              <p className="text-sm text-gray-600">Retard estimé</p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                {prediction.confidence}%
              </p>
              <p className="text-sm text-gray-600">Confiance</p>
            </div>
          </div>

          {/* Facteurs d'impact */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Facteurs d'impact</h4>
            {Object.entries(prediction.factors).map(([factor, impact]) => (
              <div key={factor} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {factor.charAt(0).toUpperCase() + factor.slice(1)}
                </span>
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-primary-600 rounded-full"
                    style={{ width: `${impact * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Routes alternatives */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TruckIcon className="h-5 w-5 mr-2" />
            Routes alternatives
          </h3>
          
          <div className="space-y-3">
            {prediction.alternativeRoutes.map((route, index) => (
              <button
                key={index}
                onClick={() => setSelectedRoute(index)}
                className={`w-full p-3 rounded-lg border transition-all ${
                  selectedRoute === index
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Route {index + 1}</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${getTrafficColor(route.trafficLevel)}`}>
                    {route.trafficLevel === 'low' ? 'Fluide' :
                     route.trafficLevel === 'medium' ? 'Modéré' : 'Dense'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {route.estimatedTime} min • {route.route}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerte météo */}
      {prediction.weatherConditions.impact !== 'low' && (
        <div className={`mt-6 p-4 rounded-lg flex items-start space-x-3 ${
          prediction.weatherConditions.impact === 'high'
            ? 'bg-red-50'
            : 'bg-yellow-50'
        }`}>
          <ExclamationTriangleIcon className={`h-5 w-5 ${
            prediction.weatherConditions.impact === 'high'
              ? 'text-red-400'
              : 'text-yellow-400'
          }`} />
          <div>
            <p className="font-medium">
              Conditions météorologiques défavorables
            </p>
            <p className="text-sm mt-1">
              {prediction.weatherConditions.condition} - Impact {
                prediction.weatherConditions.impact === 'medium' ? 'modéré' : 'important'
              } sur la livraison
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
