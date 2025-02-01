import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  IconButton,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Driver } from '../../types/driver';
import { useDriverPerformance } from '../../hooks/useDriverPerformance';

interface DriverPerformanceProps {
  driver: Driver;
  onBack: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DriverPerformance: React.FC<DriverPerformanceProps> = ({
  driver,
  onBack,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const { performance, loading, error } = useDriverPerformance(driver.id);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Typography color="error">
        Erreur lors du chargement des performances: {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Performance du chauffeur</Typography>
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ mb: 2 }}
      >
        <Tab label="Vue d'ensemble" icon={<StarIcon />} />
        <Tab label="Livraisons" icon={<TimelineIcon />} />
        <Tab label="Incidents" icon={<WarningIcon />} />
        <Tab label="Tendances" icon={<TrendingUpIcon />} />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Score global" />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h3" sx={{ mr: 2 }}>
                    {performance.overallScore}%
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={performance.overallScore}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Ponctualité
                    </Typography>
                    <Typography variant="body1">
                      {performance.punctualityScore}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Satisfaction client
                    </Typography>
                    <Typography variant="body1">
                      {performance.customerSatisfaction}%
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Répartition des livraisons" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={performance.deliveryDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {performance.deliveryDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardHeader title="Évolution mensuelle" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performance.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="deliveries"
                      stroke="#8884d8"
                      name="Livraisons"
                    />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#82ca9d"
                      name="Note"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={2}>
          {/* Contenu de l'onglet Livraisons */}
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={2}>
          {/* Contenu de l'onglet Incidents */}
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={2}>
          {/* Contenu de l'onglet Tendances */}
        </Grid>
      )}
    </Box>
  );
};

export default DriverPerformance;
