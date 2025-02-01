'use client';

import { useState, useEffect } from 'react';
import {
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import DeliveryTracker from './DeliveryTracker';
import QuickShipForm from './QuickShipForm';
import ShipmentHistory from './ShipmentHistory';
import ClientChat from './ClientChat';

interface Delivery {
  id: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  scheduledDate: string;
  estimatedArrival: string;
  driverInfo?: {
    name: string;
    phone: string;
    rating: number;
  };
}

interface ClientDashboardProps {
  clientId: string;
}

export default function ClientDashboard({ clientId }: ClientDashboardProps) {
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showQuickShip, setShowQuickShip] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [notifications, setNotifications] = useState<{
    unreadMessages: number;
    deliveryUpdates: number;
  }>({ unreadMessages: 0, deliveryUpdates: 0 });

  useEffect(() => {
    fetchActiveDeliveries();
    fetchNotifications();
  }, [clientId]);

  const fetchActiveDeliveries = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}/deliveries/active`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des livraisons');
      }

      const data = await response.json();
      setActiveDeliveries(data);
      if (data.length > 0 && !selectedDelivery) {
        setSelectedDelivery(data[0]);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des notifications');
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en cours':
        return 'bg-blue-100 text-blue-800';
      case 'livré':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord Client
        </h1>
        <button
          onClick={() => setShowQuickShip(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Nouvelle Expédition
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des livraisons actives */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">
                Livraisons Actives
              </h2>
            </div>
            <div className="divide-y">
              {activeDeliveries.map((delivery) => (
                <button
                  key={delivery.id}
                  onClick={() => setSelectedDelivery(delivery)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedDelivery?.id === delivery.id
                      ? 'bg-primary-50'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        Livraison #{delivery.id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {delivery.deliveryAddress}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        delivery.status
                      )}`}
                    >
                      {delivery.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {new Date(delivery.estimatedArrival).toLocaleTimeString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Historique des expéditions */}
          <div className="mt-8">
            <ShipmentHistory clientId={clientId} />
          </div>
        </div>

        {/* Détails de la livraison sélectionnée */}
        <div className="lg:col-span-2">
          {selectedDelivery ? (
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Livraison #{selectedDelivery.id.slice(-6)}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Prévu pour le{' '}
                      {new Date(selectedDelivery.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowChat(true)}
                      className="p-2 text-gray-400 hover:text-gray-500"
                    >
                      <ChatBubbleLeftRightIcon className="w-6 h-6" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-500">
                      <DocumentTextIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Informations du chauffeur */}
                {selectedDelivery.driverInfo && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900">
                      Chauffeur
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <TruckIcon className="w-6 h-6 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {selectedDelivery.driverInfo.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedDelivery.driverInfo.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <StarIcon className="w-5 h-5 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-600">
                          {selectedDelivery.driverInfo.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suivi de la livraison */}
                <DeliveryTracker delivery={selectedDelivery} />
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <TruckIcon className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucune livraison sélectionnée
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Sélectionnez une livraison pour voir les détails
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Quick Ship */}
      {showQuickShip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <QuickShipForm
              clientId={clientId}
              onClose={() => setShowQuickShip(false)}
              onSuccess={() => {
                setShowQuickShip(false);
                fetchActiveDeliveries();
              }}
            />
          </div>
        </div>
      )}

      {/* Modal Chat */}
      {showChat && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px]">
            <ClientChat
              clientId={clientId}
              deliveryId={selectedDelivery.id}
              onClose={() => setShowChat(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
