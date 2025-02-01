import React from 'react';
import { motion } from 'framer-motion';
import ModernSidebar from '@/components/dashboard/ModernSidebar';
import GenerativeBackground from '@/components/dashboard/GenerativeBackground';
import DeliveryCard from '@/components/dashboard/DeliveryCard';
import StatCard from '@/components/dashboard/StatCard';

const Dashboard: React.FC = () => {
  const deliveries = [
    {
      id: 'DEL001',
      status: 'in_progress' as const,
      address: '15 Rue de la Paix, Paris',
      time: '14:30',
      driver: {
        name: 'Jean Dupont',
        avatar: '/avatars/driver1.jpg',
      },
    },
    {
      id: 'DEL002',
      status: 'pending' as const,
      address: '8 Avenue des Champs-Élysées, Paris',
      time: '15:45',
      driver: {
        name: 'Marie Martin',
        avatar: '/avatars/driver2.jpg',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <GenerativeBackground />
      <ModernSidebar />

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900"
            >
              Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500"
            >
              Bienvenue sur votre tableau de bord Transwift
            </motion.p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-shadow"
          >
            + Nouvelle Livraison
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Livraisons Aujourd'hui"
            value={24}
            change={12}
            icon="📦"
            color="blue"
          />
          <StatCard
            title="Chauffeurs Actifs"
            value={8}
            change={-2}
            icon="🚚"
            color="green"
          />
          <StatCard
            title="Taux de Satisfaction"
            value="98%"
            change={5}
            icon="⭐"
            color="yellow"
          />
          <StatCard
            title="Chiffre d'Affaires"
            value="2,450 €"
            change={15}
            icon="💶"
            color="purple"
          />
        </div>

        {/* Deliveries Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Livraisons en cours</h2>
            <button className="text-blue-600 hover:text-blue-700">Voir tout →</button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {deliveries.map((delivery) => (
              <DeliveryCard key={delivery.id} delivery={delivery} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
