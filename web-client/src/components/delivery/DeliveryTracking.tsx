'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface DeliveryStatus {
  id: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered';
  timestamp: string;
  location?: string;
  description: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  photo: string;
  rating: number;
}

interface DeliveryDetails {
  id: string;
  trackingNumber: string;
  status: DeliveryStatus[];
  estimatedDelivery: string;
  driver?: Driver;
  pickupAddress: string;
  dropoffAddress: string;
  recipientName: string;
  recipientPhone: string;
}

const mockDelivery: DeliveryDetails = {
  id: '1',
  trackingNumber: 'TW-123456',
  status: [
    {
      id: '1',
      status: 'pending',
      timestamp: '2024-12-28 14:30',
      description: 'Commande confirmée',
    },
    {
      id: '2',
      status: 'picked_up',
      timestamp: '2024-12-28 15:00',
      location: '123 Rue de Paris',
      description: 'Colis récupéré',
    },
    {
      id: '3',
      status: 'in_transit',
      timestamp: '2024-12-28 15:30',
      location: 'En route vers la destination',
      description: 'En cours de livraison',
    },
  ],
  estimatedDelivery: '2024-12-28 16:30',
  driver: {
    id: '1',
    name: 'Jean Dupont',
    phone: '+33 6 12 34 56 78',
    photo: '/drivers/1.jpg',
    rating: 4.8,
  },
  pickupAddress: '123 Rue de Paris, 75001 Paris',
  dropoffAddress: '456 Avenue des Champs-Élysées, 75008 Paris',
  recipientName: 'Marie Martin',
  recipientPhone: '+33 6 98 76 54 32',
};

const statusConfig = {
  pending: {
    icon: ClockIcon,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    label: 'En attente',
  },
  picked_up: {
    icon: MapPinIcon,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    label: 'Récupéré',
  },
  in_transit: {
    icon: TruckIcon,
    color: 'text-primary-500',
    bgColor: 'bg-primary-100',
    label: 'En transit',
  },
  delivered: {
    icon: CheckCircleIcon,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    label: 'Livré',
  },
};

export default function DeliveryTracking() {
  const [delivery, setDelivery] = useState<DeliveryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un appel API
    setTimeout(() => {
      setDelivery(mockDelivery);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune information de livraison trouvée</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* En-tête */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Suivi de livraison
            </h2>
            <p className="text-sm text-gray-500">
              N° de suivi: {delivery.trackingNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              Livraison estimée
            </p>
            <p className="text-sm text-gray-500">
              {delivery.estimatedDelivery}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Timeline de statut */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Statut de la livraison
          </h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {delivery.status.map((status, index) => {
                const config = statusConfig[status.status];
                const StatusIcon = config.icon;
                const isLast = index === delivery.status.length - 1;

                return (
                  <motion.li
                    key={status.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={isLast ? '' : 'pb-8'}
                  >
                    <div className="relative">
                      {!isLast && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full ${config.bgColor} flex items-center justify-center ring-8 ring-white`}
                          >
                            <StatusIcon
                              className={`h-5 w-5 ${config.color}`}
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {config.label}
                            </p>
                            <p className="text-sm text-gray-500">
                              {status.timestamp}
                            </p>
                          </div>
                          {status.location && (
                            <p className="text-sm text-gray-500 mt-1">
                              {status.location}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {status.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Informations de livraison */}
        <div>
          {/* Informations du chauffeur */}
          {delivery.driver && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Votre chauffeur
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                <img
                  src={delivery.driver.photo}
                  alt={delivery.driver.name}
                  className="h-12 w-12 rounded-full"
                />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    {delivery.driver.name}
                  </p>
                  <div className="flex items-center mt-1">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-500 ml-1">
                      {delivery.driver.rating}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {delivery.driver.phone}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Détails de la livraison */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Détails de la livraison
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Adresse de collecte
                </p>
                <div className="mt-1 flex items-center">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">
                    {delivery.pickupAddress}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Adresse de livraison
                </p>
                <div className="mt-1 flex items-center">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">
                    {delivery.dropoffAddress}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Destinataire
                </p>
                <div className="mt-1 space-y-2">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">
                      {delivery.recipientName}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">
                      {delivery.recipientPhone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
