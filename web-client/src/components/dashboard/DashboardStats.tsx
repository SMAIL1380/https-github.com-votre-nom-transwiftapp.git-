'use client';

import { motion } from 'framer-motion';
import {
  TruckIcon,
  CurrencyEuroIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = ({ title, value, icon: Icon, trend }: StatsCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-lg shadow-md"
  >
    <div className="flex items-center">
      <div className="p-3 rounded-lg bg-primary-100">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
      {trend && (
        <div className="ml-auto">
          <div
            className={`flex items-center ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <span className="text-sm font-medium">
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </span>
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

export default function DashboardStats() {
  const stats = [
    {
      title: 'Livraisons en cours',
      value: 12,
      icon: TruckIcon,
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Revenus du mois',
      value: '2,540 €',
      icon: CurrencyEuroIcon,
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Temps moyen',
      value: '28 min',
      icon: ClockIcon,
      trend: { value: 3, isPositive: false },
    },
    {
      title: 'Note moyenne',
      value: '4.8',
      icon: StarIcon,
      trend: { value: 5, isPositive: true },
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
