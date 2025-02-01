'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DeliveryList from '@/components/dashboard/DeliveryList';
import RevenueChart from '@/components/dashboard/RevenueChart';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold text-gray-900">
              Bonjour, Sophie 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Voici un aperçu de votre activité aujourd'hui
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="mb-8">
            <DashboardStats />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>

            {/* Delivery List */}
            <div className="lg:col-span-2">
              <DeliveryList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
