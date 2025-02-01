import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
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
import { format, subDays, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AnalyticsData {
  trends: {
    daily: {
      date: string;
      count: number;
      avgResolutionTime: number;
    }[];
    monthly: {
      month: string;
      count: number;
      avgResolutionTime: number;
    }[];
  };
  distribution: {
    byType: {
      type: string;
      count: number;
      percentage: number;
    }[];
    bySeverity: {
      severity: string;
      count: number;
      percentage: number;
    }[];
    byStatus: {
      status: string;
      count: number;
      percentage: number;
    }[];
  };
  performance: {
    avgResolutionTime: number;
    resolutionRate: number;
    customerSatisfaction: number;
    costImpact: number;
  };
  hotspots: {
    location: string;
    count: number;
    severity: string;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const IncidentAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/incidents/analytics?timeRange=${timeRange}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPerformanceMetrics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Temps moyen de résolution
            </Typography>
            <Typography variant="h4">
              {Math.round(analyticsData?.performance.avgResolutionTime || 0)} min
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Taux de résolution
            </Typography>
            <Typography variant="h4">
              {(analyticsData?.performance.resolutionRate || 0) * 100}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Satisfaction client
            </Typography>
            <Typography variant="h4">
              {(analyticsData?.performance.customerSatisfaction || 0) * 100}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Impact financier
            </Typography>
            <Typography variant="h4">
              {analyticsData?.performance.costImpact.toLocaleString()}€
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTrendCharts = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tendance des Incidents
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={analyticsData?.trends.daily}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="count"
                  name="Nombre d'incidents"
                  stroke="#8884d8"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgResolutionTime"
                  name="Temps de résolution moyen (min)"
                  stroke="#82ca9d"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDistributionCharts = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribution par Type
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.distribution.byType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analyticsData?.distribution.byType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribution par Sévérité
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.distribution.bySeverity}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analyticsData?.distribution.bySeverity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribution par Statut
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.distribution.byStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analyticsData?.distribution.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderHotspots = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Zones à Risque
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData?.hotspots}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="location" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Nombre d'incidents" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Analyse des Incidents</Typography>
        <Box display="flex" gap={2}>
          <FormControl>
            <InputLabel>Période</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Période"
            >
              <MenuItem value="7d">7 jours</MenuItem>
              <MenuItem value="30d">30 jours</MenuItem>
              <MenuItem value="90d">90 jours</MenuItem>
              <MenuItem value="365d">1 an</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={fetchAnalytics}>
            Actualiser
          </Button>
        </Box>
      </Box>

      <Box mb={3}>{renderPerformanceMetrics()}</Box>
      <Box mb={3}>{renderTrendCharts()}</Box>
      <Box mb={3}>{renderDistributionCharts()}</Box>
      <Box mb={3}>{renderHotspots()}</Box>
    </Box>
  );
};
