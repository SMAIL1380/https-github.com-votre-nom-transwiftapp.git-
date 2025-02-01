'use client';

import { useEffect, useState } from 'react';
import {
  TruckIcon,
  MapPinIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface Location {
  lat: number;
  lng: number;
}

interface Delivery {
  id: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  scheduledDate: string;
  estimatedArrival: string;
  currentLocation?: Location;
}

interface Step {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  timestamp?: string;
}

interface DeliveryTrackerProps {
  delivery: Delivery;
}

export default function DeliveryTracker({ delivery }: DeliveryTrackerProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);

  useEffect(() => {
    // Générer les étapes basées sur le statut de la livraison
    const generateSteps = () => {
      const baseSteps: Step[] = [
        {
          id: '1',
          title: 'Commande confirmée',
          description: 'Votre commande a été enregistrée',
          status: 'completed',
          timestamp: new Date(delivery.scheduledDate).toLocaleString(),
        },
        {
          id: '2',
          title: 'Prise en charge',
          description: 'Le chauffeur a récupéré votre colis',
          status: 'upcoming',
        },
        {
          id: '3',
          title: 'En route',
          description: 'Votre colis est en cours de livraison',
          status: 'upcoming',
        },
        {
          id: '4',
          title: 'Livré',
          description: 'Votre colis a été livré',
          status: 'upcoming',
        },
      ];

      // Mettre à jour les statuts en fonction de l'état actuel
      switch (delivery.status.toLowerCase()) {
        case 'en attente':
          baseSteps[0].status = 'completed';
          baseSteps[1].status = 'upcoming';
          break;
        case 'en cours':
          baseSteps[0].status = 'completed';
          baseSteps[1].status = 'completed';
          baseSteps[2].status = 'current';
          break;
        case 'livré':
          baseSteps.forEach((step) => (step.status = 'completed'));
          break;
      }

      setSteps(baseSteps);
    };

    generateSteps();
  }, [delivery]);

  useEffect(() => {
    if (delivery.status.toLowerCase() === 'en cours') {
      // Simuler la mise à jour de la position du chauffeur
      const interval = setInterval(async () => {
        try {
          const response = await fetch(
            `/api/deliveries/${delivery.id}/location`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setDriverLocation(data.location);
          }
        } catch (error) {
          console.error('Erreur:', error);
        }
      }, 30000); // Mise à jour toutes les 30 secondes

      return () => clearInterval(interval);
    }
  }, [delivery.id, delivery.status]);

  return (
    <div className="space-y-8">
      {/* Carte de suivi */}
      <div className="h-64 bg-gray-100 rounded-lg relative">
        {/* Intégrer ici la carte avec la position du chauffeur */}
        {/* Utiliser Google Maps ou une autre bibliothèque de cartographie */}
      </div>

      {/* Timeline de progression */}
      <div className="relative">
        <div
          className="absolute inset-0 flex items-center"
          aria-hidden="true"
        >
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-between">
          {steps.map((step, stepIdx) => (
            <div
              key={step.id}
              className="flex flex-col items-center"
            >
              <div
                className={`relative flex h-12 w-12 items-center justify-center rounded-full ${
                  step.status === 'completed'
                    ? 'bg-primary-600'
                    : step.status === 'current'
                    ? 'bg-primary-200'
                    : 'bg-gray-200'
                }`}
              >
                {step.status === 'completed' ? (
                  <CheckCircleIcon
                    className="h-8 w-8 text-white"
                    aria-hidden="true"
                  />
                ) : step.status === 'current' ? (
                  <TruckIcon
                    className="h-8 w-8 text-primary-700"
                    aria-hidden="true"
                  />
                ) : (
                  <MapPinIcon
                    className="h-8 w-8 text-gray-400"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm font-medium text-gray-900">
                  {step.title}
                </div>
                <div className="text-sm text-gray-500">
                  {step.description}
                </div>
                {step.timestamp && (
                  <div className="text-xs text-gray-400 mt-1">
                    {step.timestamp}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Informations de livraison */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Adresse de départ
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {delivery.pickupAddress}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Adresse de livraison
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {delivery.deliveryAddress}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Heure estimée d'arrivée
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(delivery.estimatedArrival).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Statut actuel
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {delivery.status}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
