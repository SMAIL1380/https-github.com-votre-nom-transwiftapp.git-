'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const mockData = [
  { date: '01/12', revenue: 1200 },
  { date: '08/12', revenue: 1800 },
  { date: '15/12', revenue: 1400 },
  { date: '22/12', revenue: 2200 },
  { date: '29/12', revenue: 1900 },
];

const timeRanges = [
  { label: '7 jours', value: '7d' },
  { label: '30 jours', value: '30d' },
  { label: '90 jours', value: '90d' },
];

export default function RevenueChart() {
  const [selectedRange, setSelectedRange] = useState('7d');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Revenus
        </h2>
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selectedRange === range.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mockData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fill: '#6b7280' }}
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
              }}
              formatter={(value: number) => [`${value}€`, 'Revenus']}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#7C3AED"
              strokeWidth={2}
              dot={{ fill: '#7C3AED', strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: '7 500€' },
          { label: 'Moyenne', value: '1 875€' },
          { label: 'Projection', value: '9 200€' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
