import React from 'react';
import { motion } from 'framer-motion';

interface DeliveryCardProps {
  delivery: {
    id: string;
    status: 'pending' | 'in_progress' | 'completed';
    address: string;
    time: string;
    driver: {
      name: string;
      avatar: string;
    };
  };
}

const statusColors = {
  pending: 'bg-yellow-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
};

const statusLabels = {
  pending: 'En attente',
  in_progress: 'En cours',
  completed: 'Terminée',
};

const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-gray-500 mb-1">Livraison #{delivery.id}</div>
          <div className="font-medium text-gray-900">{delivery.address}</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-white text-sm ${statusColors[delivery.status]}`}>
          {statusLabels[delivery.status]}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 mr-3">
            <img
              src={delivery.driver.avatar}
              alt={delivery.driver.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{delivery.driver.name}</div>
            <div className="text-xs text-gray-500">Chauffeur</div>
          </div>
        </div>
        <div className="text-sm text-gray-500">{delivery.time}</div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: delivery.status === 'completed' ? '100%' : 
                     delivery.status === 'in_progress' ? '50%' : '20%'
            }}
            className={`h-full rounded-full ${statusColors[delivery.status]}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default DeliveryCard;
