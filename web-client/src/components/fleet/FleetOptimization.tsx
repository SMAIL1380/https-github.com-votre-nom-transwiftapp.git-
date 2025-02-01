'use client';

import { useState, useEffect } from 'react';
import {
  TruckIcon,
  UserGroupIcon,
  ChartBarIcon,
  MapIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Driver {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  location: {
    lat: number;
    lng: number;
  };
  currentLoad: number;
  maxCapacity: number;
  specializations: string[];
  rating: number;
  deliveriesCompleted: number;
}

interface Delivery {
  id: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: string;
  priority: number;
  size: number;
  specialRequirements?: string[];
  timeWindow: {
    start: string;
    end: string;
  };
}

interface OptimizationMetrics {
  averageDeliveryTime: number;
  fleetUtilization: number;
  onTimeDeliveryRate: number;
  fuelEfficiency: number;
  costPerDelivery: number;
}

interface FleetOptimizationProps {
  onAssignmentUpdate?: (assignments: { deliveryId: string; driverId: string }[]) => void;
}

export default function FleetOptimization({ onAssignmentUpdate }: FleetOptimizationProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [metrics, setMetrics] = useState<OptimizationMetrics | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedView, setSelectedView] = useState<'map' | 'list' | 'metrics'>('map');
  const [autoOptimize, setAutoOptimize] = useState(false);

  useEffect(() => {
    fetchFleetData();
    if (autoOptimize) {
      const interval = setInterval(optimizeAssignments, 5 * 60 * 1000); // Optimiser toutes les 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoOptimize]);

  const fetchFleetData = async () => {
    try {
      const [driversResponse, deliveriesResponse, metricsResponse] = await Promise.all([
        fetch('/api/fleet/drivers', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('/api/fleet/deliveries', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('/api/fleet/metrics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      if (!driversResponse.ok || !deliveriesResponse.ok || !metricsResponse.ok) {
        throw new Error('Erreur lors du chargement des données');
      }

      const [driversData, deliveriesData, metricsData] = await Promise.all([
        driversResponse.json(),
        deliveriesResponse.json(),
        metricsResponse.json(),
      ]);

      setDrivers(driversData);
      setDeliveries(deliveriesData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const optimizeAssignments = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/fleet/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          drivers: drivers.map(d => ({
            id: d.id,
            location: d.location,
            capacity: d.maxCapacity - d.currentLoad,
            specializations: d.specializations,
          })),
          deliveries: deliveries.filter(d => d.status === 'pending'),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'optimisation');
      }

      const optimizedAssignments = await response.json();
      if (onAssignmentUpdate) {
        onAssignmentUpdate(optimizedAssignments);
      }

      // Mettre à jour les métriques après l'optimisation
      const newMetricsResponse = await fetch('/api/fleet/metrics', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      
      if (newMetricsResponse.ok) {
        const newMetrics = await newMetricsResponse.json();
        setMetrics(newMetrics);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const renderMetricsCard = (title: string, value: number, unit: string, icon: JSX.Element) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-primary-100 rounded-lg">
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">
              {value.toFixed(1)} {unit}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Optimisation de Flotte
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setAutoOptimize(!autoOptimize)}
            className={`flex items-center px-4 py-2 rounded-lg ${
              autoOptimize
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Auto-Optimisation
          </button>
          <button
            onClick={optimizeAssignments}
            disabled={isOptimizing}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isOptimizing ? (
              <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <ChartBarIcon className="w-5 h-5 mr-2" />
            )}
            Optimiser
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setSelectedView('map')}
          className={`flex items-center px-4 py-2 rounded-lg ${
            selectedView === 'map'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <MapIcon className="w-5 h-5 mr-2" />
          Carte
        </button>
        <button
          onClick={() => setSelectedView('list')}
          className={`flex items-center px-4 py-2 rounded-lg ${
            selectedView === 'list'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <TruckIcon className="w-5 h-5 mr-2" />
          Liste
        </button>
        <button
          onClick={() => setSelectedView('metrics')}
          className={`flex items-center px-4 py-2 rounded-lg ${
            selectedView === 'metrics'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ChartBarIcon className="w-5 h-5 mr-2" />
          Métriques
        </button>
      </div>

      {/* Contenu principal */}
      <div className="space-y-6">
        {selectedView === 'metrics' && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderMetricsCard(
              'Temps moyen de livraison',
              metrics.averageDeliveryTime,
              'min',
              <ClockIcon className="w-6 h-6 text-primary-600" />
            )}
            {renderMetricsCard(
              'Utilisation de la flotte',
              metrics.fleetUtilization * 100,
              '%',
              <TruckIcon className="w-6 h-6 text-primary-600" />
            )}
            {renderMetricsCard(
              'Taux de livraison à temps',
              metrics.onTimeDeliveryRate * 100,
              '%',
              <ChartBarIcon className="w-6 h-6 text-primary-600" />
            )}
            {renderMetricsCard(
              'Efficacité énergétique',
              metrics.fuelEfficiency,
              'km/L',
              <ChartBarIcon className="w-6 h-6 text-primary-600" />
            )}
            {renderMetricsCard(
              'Coût par livraison',
              metrics.costPerDelivery,
              '€',
              <ChartBarIcon className="w-6 h-6 text-primary-600" />
            )}
          </div>
        )}

        {selectedView === 'list' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Liste des chauffeurs */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserGroupIcon className="w-5 h-5 mr-2" />
                  Chauffeurs
                </h3>
              </div>
              <div className="divide-y">
                {drivers.map((driver) => (
                  <div key={driver.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{driver.name}</p>
                        <p className="text-sm text-gray-500">
                          {driver.deliveriesCompleted} livraisons • {driver.rating.toFixed(1)} ⭐
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            driver.status === 'available'
                              ? 'bg-green-100 text-green-800'
                              : driver.status === 'busy'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {driver.status === 'available'
                            ? 'Disponible'
                            : driver.status === 'busy'
                            ? 'Occupé'
                            : 'Hors ligne'}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {driver.currentLoad}/{driver.maxCapacity} kg
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Liste des livraisons */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <TruckIcon className="w-5 h-5 mr-2" />
                  Livraisons en attente
                </h3>
              </div>
              <div className="divide-y">
                {deliveries
                  .filter((d) => d.status === 'pending')
                  .map((delivery) => (
                    <div key={delivery.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {delivery.pickupAddress} → {delivery.deliveryAddress}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(delivery.timeWindow.start).toLocaleTimeString()} -{' '}
                            {new Date(delivery.timeWindow.end).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              delivery.priority > 8
                                ? 'bg-red-100 text-red-800'
                                : delivery.priority > 5
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            Priorité {delivery.priority}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {delivery.size} kg
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'map' && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="h-[600px] bg-gray-100 rounded-lg">
              {/* Intégrer ici la carte avec les positions des chauffeurs et les livraisons */}
              {/* Utiliser une bibliothèque comme Google Maps ou Mapbox */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
