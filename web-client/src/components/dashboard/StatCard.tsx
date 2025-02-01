import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'bg-blue-500',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    icon: 'bg-green-500',
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    icon: 'bg-yellow-500',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: 'bg-purple-500',
  },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
  const colors = colorVariants[color];

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${colors.bg} rounded-2xl p-6`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center text-white text-2xl`}>
          {icon}
        </div>
        <div className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-gray-500 text-sm">{title}</div>
        <div className={`text-2xl font-bold ${colors.text}`}>{value}</div>
      </div>

      {/* Animated Decoration */}
      <div className="absolute bottom-0 right-0 p-6">
        <motion.svg
          width="60"
          height="60"
          viewBox="0 0 60 60"
          initial={{ opacity: 0.1 }}
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={colors.text}
        >
          <path
            d="M30 0C13.4315 0 0 13.4315 0 30C0 46.5685 13.4315 60 30 60C46.5685 60 60 46.5685 60 30C60 13.4315 46.5685 0 30 0ZM30 45C21.7157 45 15 38.2843 15 30C15 21.7157 21.7157 15 30 15C38.2843 15 45 21.7157 45 30C45 38.2843 38.2843 45 30 45Z"
            fillOpacity="0.1"
          />
        </motion.svg>
      </div>
    </motion.div>
  );
};

export default StatCard;
