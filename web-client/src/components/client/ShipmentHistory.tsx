'use client';

import { useState, useEffect } from 'react';
import {
  TruckIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Shipment {
  id: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  completedAt: string;
  rating?: number;
  cost: number;
  driver?: {
    name: string;
    rating: number;
  };
}

interface ShipmentHistoryProps {
  clientId: string;
}

export default function ShipmentHistory({ clientId }: ShipmentHistoryProps) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchShipmentHistory();
  }, [clientId, timeframe]);

  const fetchShipmentHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/clients/${clientId}/shipments?timeframe=${timeframe}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement de l\'historique');
      }

      const data = await response.json();
      setShipments(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'livré':
        return 'bg-green-100 text-green-800';
      case 'annulé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadInvoice = async (shipmentId: string) => {
    try {
      const response = await fetch(
        `/api/shipments/${shipmentId}/invoice`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement de la facture');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${shipmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Historique des Expéditions
          </h2>
          <div className="flex space-x-2">
            {['week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period as 'week' | 'month' | 'year')}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeframe === period
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {period === 'week'
                  ? 'Semaine'
                  : period === 'month'
                  ? 'Mois'
                  : 'Année'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      ) : shipments.length === 0 ? (
        <div className="p-8 text-center">
          <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Aucune expédition
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Vous n'avez pas encore d'expéditions pour cette période
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {shipments.map((shipment) => (
            <div
              key={shipment.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    setSelectedShipment(shipment);
                    setShowDetails(true);
                  }}
                >
                  <div className="flex items-center">
                    <TruckIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Livraison #{shipment.id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(
                          new Date(shipment.completedAt),
                          'PPP',
                          { locale: fr }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        shipment.status
                      )}`}
                    >
                      {shipment.status}
                    </span>
                    {shipment.rating && (
                      <div className="ml-4 flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-600">
                          {shipment.rating}
                        </span>
                      </div>
                    )}
                    <span className="ml-4 text-sm text-gray-500">
                      {shipment.cost.toFixed(2)} €
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadInvoice(shipment.id)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                  </button>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de détails */}
      {showDetails && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">
                  Détails de la livraison
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Fermer</span>
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Adresse de départ
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedShipment.pickupAddress}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Adresse de livraison
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedShipment.deliveryAddress}
                  </p>
                </div>

                {selectedShipment.driver && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Chauffeur
                    </p>
                    <div className="mt-1 flex items-center">
                      <span className="text-sm text-gray-900">
                        {selectedShipment.driver.name}
                      </span>
                      <div className="ml-4 flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-600">
                          {selectedShipment.driver.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Date de livraison
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(
                      new Date(selectedShipment.completedAt),
                      'PPP à HH:mm',
                      { locale: fr }
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Montant
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedShipment.cost.toFixed(2)} €
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleDownloadInvoice(selectedShipment.id)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <DocumentTextIcon
                    className="h-5 w-5 mr-2 text-gray-400"
                    aria-hidden="true"
                  />
                  Télécharger la facture
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
