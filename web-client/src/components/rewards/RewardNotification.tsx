'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Reward {
  id: string;
  type: 'badge' | 'challenge' | 'level';
  title: string;
  description: string;
  xp?: number;
  icon?: string;
}

interface RewardNotificationProps {
  reward: Reward;
  onClose: () => void;
  autoCloseDelay?: number;
}

export default function RewardNotification({
  reward,
  onClose,
  autoCloseDelay = 5000,
}: RewardNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Attendre la fin de l'animation
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [autoCloseDelay, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 max-w-sm bg-white rounded-lg shadow-lg z-50 overflow-hidden"
        >
          <div className="relative">
            {/* Fond animé */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 opacity-10"
            />

            <div className="relative p-4">
              {/* En-tête */}
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <StarIcon className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {reward.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {reward.description}
                    </p>
                    {reward.xp && (
                      <p className="mt-1 text-sm font-medium text-primary-600">
                        +{reward.xp} XP
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }}
                  className="flex-shrink-0 ml-4"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-500" />
                </button>
              </div>

              {/* Barre de progression */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: autoCloseDelay / 1000, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-1 bg-primary-600"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
