'use client';

import { motion } from 'framer-motion';
import DeliveryTracking from '@/components/delivery/DeliveryTracking';

export default function TrackDeliveryPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900">
            Suivi de livraison
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Suivez votre livraison en temps réel
          </p>
        </motion.div>

        <DeliveryTracking />
      </div>
    </div>
  );
}
