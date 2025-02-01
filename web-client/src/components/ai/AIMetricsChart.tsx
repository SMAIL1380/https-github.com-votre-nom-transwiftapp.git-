import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { ScheduleOptimizationResult } from '../../types/schedule';

interface AIMetricsChartProps {
  metrics: ScheduleOptimizationResult['metrics'] | null;
  selectedMetric: string | null;
  onMetricSelect: (metric: string) => void;
}

const AIMetricsChart: React.FC<AIMetricsChartProps> = ({
  metrics,
  selectedMetric,
  onMetricSelect,
}) => {
  if (!metrics) return null;

  const prepareDriverUtilizationData = () => {
    return Object.entries(metrics.driverUtilization).map(([driverId, hours]) => ({
      name: driverId,
      hours: Math.round(hours / (1000 * 60 * 60) * 100) / 100,
    }));
  };

  const prepareVehicleUtilizationData = () => {
    return Object.entries(metrics.vehicleUtilization).map(([vehicleId, hours]) => ({
      name: vehicleId,
      hours: Math.round(hours / (1000 * 60 * 60) * 100) / 100,
    }));
  };

  const prepareSavingsData = () => {
    return [
      {
        name: 'Distance',
        original: metrics.totalDistance,
        optimized: metrics.totalDistance - metrics.savings.distance,
        savings: metrics.savings.distance,
      },
      {
        name: 'Durée',
        original: metrics.totalDuration,
        optimized: metrics.totalDuration - metrics.savings.duration,
        savings: metrics.savings.duration,
      },
      {
        name: 'Carburant',
        original: metrics.fuelConsumption,
        optimized: metrics.fuelConsumption - metrics.savings.fuel,
        savings: metrics.savings.fuel,
      },
      {
        name: 'CO2',
        original: metrics.co2Emissions,
        optimized: metrics.co2Emissions - metrics.savings.co2,
        savings: metrics.savings.co2,
      },
    ];
  };

  const renderChart = () => {
    switch (selectedMetric) {
      case 'drivers':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareDriverUtilizationData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hours" fill="#8884d8" name="Heures de travail" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'vehicles':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareVehicleUtilizationData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hours" fill="#82ca9d" name="Heures d'utilisation" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'savings':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareSavingsData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="original" fill="#ff4444" name="Original" />
              <Bar dataKey="optimized" fill="#44ff44" name="Optimisé" />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareSavingsData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="#8884d8"
                name="Économies"
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Métriques d'optimisation
          </Typography>
          <ToggleButtonGroup
            value={selectedMetric}
            exclusive
            onChange={(e, value) => onMetricSelect(value)}
            size="small"
          >
            <ToggleButton value="overview">Vue générale</ToggleButton>
            <ToggleButton value="drivers">Chauffeurs</ToggleButton>
            <ToggleButton value="vehicles">Véhicules</ToggleButton>
            <ToggleButton value="savings">Économies</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {renderChart()}

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {selectedMetric === 'drivers'
              ? "Répartition de la charge de travail entre les chauffeurs"
              : selectedMetric === 'vehicles'
              ? "Taux d'utilisation des véhicules"
              : selectedMetric === 'savings'
              ? 'Comparaison avant/après optimisation'
              : 'Vue d'ensemble des économies réalisées'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AIMetricsChart;
