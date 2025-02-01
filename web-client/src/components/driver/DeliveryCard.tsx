'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Delivery {
  id: string;
  pickupAddress: string;
  deliveryAddress: string;
  customer: {
    name: string;
    phone: string;
  };
  scheduledDate: string;
  description?: string;
}

interface DeliveryCardProps {
  delivery: Delivery;
  onAccept: () => void;
}

export default function DeliveryCard({ delivery, onAccept }: DeliveryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Livraison #{delivery.id.slice(-6)}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Nouveau
          </span>
        </div>

        <div className="space-y-4">
          {/* Adresses */}
          <div className="space-y-2">
            <div className="flex items-start">
              <MapPinIcon className="h-5 w-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Ramassage</p>
                <p className="text-sm text-gray-600">{delivery.pickupAddress}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPinIcon className="h-5 w-5 text-red-500 mt-1 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Livraison</p>
                <p className="text-sm text-gray-600">{delivery.deliveryAddress}</p>
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="flex items-center">
            <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">{delivery.customer.name}</p>
              <p className="text-sm text-gray-600">{delivery.customer.phone}</p>
            </div>
          </div>

          {/* Heure */}
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
            <p className="text-sm text-gray-600">
              {format(new Date(delivery.scheduledDate), 'PPp', { locale: fr })}
            </p>
          </div>

          {/* Description */}
          {delivery.description && (
            <p className="text-sm text-gray-600 mt-2">
              {delivery.description}
            </p>
          )}
        </div>

        {/* Bouton d'acceptation */}
        <button
          onClick={onAccept}
          className="mt-6 w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          Accepter la livraison
        </button>
      </div>
    </div>
  );
}
