'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Delivery {
  id: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  createdAt: string;
  scheduledDate: string;
}

interface DeliveryListProps {
  deliveries: Delivery[];
  onDeliveryUpdated: () => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  inProgress: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusTranslations = {
  pending: 'En attente',
  inProgress: 'En cours',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

export default function DeliveryList({ deliveries, onDeliveryUpdated }: DeliveryListProps) {
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);

  const handleStatusUpdate = async (deliveryId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3000/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      toast.success('Statut mis à jour avec succès');
      onDeliveryUpdated();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
      console.error('Erreur:', error);
    }
  };

  if (!deliveries.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune livraison trouvée
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deliveries.map((delivery) => (
        <div
          key={delivery.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setExpandedDelivery(expandedDelivery === delivery.id ? null : delivery.id)}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusColors[delivery.status as keyof typeof statusColors]
              }`}>
                {statusTranslations[delivery.status as keyof typeof statusTranslations]}
              </span>
              <p className="mt-2 text-sm text-gray-600">
                {format(new Date(delivery.scheduledDate), 'PPP', { locale: fr })}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusUpdate(delivery.id, 'cancelled');
              }}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Annuler
            </button>
          </div>

          {expandedDelivery === delivery.id && (
            <div className="mt-4 space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Adresse de ramassage</p>
                <p className="text-sm text-gray-900">{delivery.pickupAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Adresse de livraison</p>
                <p className="text-sm text-gray-900">{delivery.deliveryAddress}</p>
              </div>
              <div className="pt-4 flex gap-2">
                {delivery.status === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(delivery.id, 'inProgress');
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Démarrer
                  </button>
                )}
                {delivery.status === 'inProgress' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(delivery.id, 'delivered');
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                  >
                    Marquer comme livré
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
