'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface Delivery {
  id: string;
  customerName: string;
  address: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  amount: string;
}

const statusConfig = {
  pending: {
    icon: ClockIcon,
    text: 'En attente',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  in_progress: {
    icon: TruckIcon,
    text: 'En cours',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  completed: {
    icon: CheckCircleIcon,
    text: 'Terminée',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  cancelled: {
    icon: XCircleIcon,
    text: 'Annulée',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
};

const mockDeliveries: Delivery[] = [
  {
    id: '1',
    customerName: 'Sophie Martin',
    address: '15 Rue de la Paix, Paris',
    status: 'in_progress',
    date: '2024-12-28 14:30',
    amount: '25,00 €',
  },
  {
    id: '2',
    customerName: 'Jean Dupont',
    address: '8 Avenue des Champs-Élysées, Paris',
    status: 'pending',
    date: '2024-12-28 15:45',
    amount: '18,50 €',
  },
  {
    id: '3',
    customerName: 'Marie Lambert',
    address: '23 Boulevard Saint-Germain, Paris',
    status: 'completed',
    date: '2024-12-28 12:15',
    amount: '32,00 €',
  },
  {
    id: '4',
    customerName: 'Pierre Durand',
    address: '45 Rue du Commerce, Paris',
    status: 'cancelled',
    date: '2024-12-28 11:00',
    amount: '15,75 €',
  },
];

export default function DeliveryList() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeliveries = mockDeliveries.filter((delivery) => {
    const matchesStatus = selectedStatus === 'all' || delivery.status === selectedStatus;
    const matchesSearch = delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
            Livraisons récentes
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery, index) => {
                const status = statusConfig[delivery.status];
                const StatusIcon = status.icon;

                return (
                  <motion.tr
                    key={delivery.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {delivery.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{delivery.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {status.text}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.amount}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDeliveries.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune livraison trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
