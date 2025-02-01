import React, { useState, useEffect } from 'react';
import { Card, Spin } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAPI } from '../../hooks/useAPI';

interface Props {
  vehicleId: string;
}

interface DeliveryStats {
  date: string;
  deliveries: number;
  distance: number;
  fuelConsumption: number;
}

const VehicleStatsChart: React.FC<Props> = ({ vehicleId }) => {
  const { api } = useAPI();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DeliveryStats[]>([]);

  useEffect(() => {
    loadStats();
  }, [vehicleId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/vehicles/${vehicleId}/stats/daily`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading vehicle stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 24 }}>
        <Spin />
      </div>
    );
  }

  return (
    <Card title="Statistiques quotidiennes">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={stats}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="deliveries"
            name="Livraisons"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="distance"
            name="Distance (km)"
            stroke="#82ca9d"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="fuelConsumption"
            name="Consommation (L/100km)"
            stroke="#ffc658"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default VehicleStatsChart;
