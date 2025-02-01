import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Driver {
  id: string;
  name: string;
  rating: number;
  totalOrders: number;
  cancellations: number;
  reassignments: number;
  balance: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'WARNING';
}

interface FleetMetrics {
  totalDrivers: number;
  activeDrivers: number;
  averageRating: number;
  totalCancellations: number;
  totalReassignments: number;
  averageResponseTime: number;
  revenueStats: {
    date: string;
    revenue: number;
    penalties: number;
    bonuses: number;
  }[];
  performanceDistribution: {
    range: string;
    count: number;
  }[];
}

export const FleetDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<FleetMetrics | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const [metricsResponse, driversResponse] = await Promise.all([
        fetch(`/api/fleet/metrics?timeRange=${timeRange}`),
        fetch(`/api/fleet/drivers?timeRange=${timeRange}`),
      ]);

      const metricsData = await metricsResponse.json();
      const driversData = await driversResponse.json();

      setMetrics(metricsData);
      setDrivers(driversData);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };

  const handleDriverAction = async (action: string) => {
    if (!selectedDriver) return;

    try {
      await fetch(`/api/fleet/drivers/${selectedDriver.id}/${action}`, {
        method: 'POST',
      });

      // Rafraîchir les données
      await fetchDashboardData();
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
    }

    setAnchorEl(null);
  };

  const renderMetricsCards = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Chauffeurs Actifs
            </Typography>
            <Typography variant="h4">
              {metrics?.activeDrivers}/{metrics?.totalDrivers}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Note Moyenne
            </Typography>
            <Typography variant="h4">
              {metrics?.averageRating.toFixed(1)}/5
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Taux d'Annulation
            </Typography>
            <Typography variant="h4">
              {((metrics?.totalCancellations || 0) / (metrics?.totalDrivers || 1)).toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Temps de Réponse Moyen
            </Typography>
            <Typography variant="h4">
              {metrics?.averageResponseTime.toFixed(1)}min
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderRevenueChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Revenus et Pénalités
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics?.revenueStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), 'dd/MM')}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenus"
              stroke="#8884d8"
            />
            <Line
              type="monotone"
              dataKey="penalties"
              name="Pénalités"
              stroke="#ff0000"
            />
            <Line
              type="monotone"
              dataKey="bonuses"
              name="Bonus"
              stroke="#82ca9d"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderPerformanceDistribution = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Distribution des Performances
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={metrics?.performanceDistribution}
              dataKey="count"
              nameKey="range"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {metrics?.performanceDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderDriversTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Chauffeur</TableCell>
            <TableCell>Note</TableCell>
            <TableCell>Livraisons</TableCell>
            <TableCell>Annulations</TableCell>
            <TableCell>Réaffectations</TableCell>
            <TableCell>Balance</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell>{driver.name}</TableCell>
              <TableCell>{driver.rating.toFixed(1)}/5</TableCell>
              <TableCell>{driver.totalOrders}</TableCell>
              <TableCell>{driver.cancellations}</TableCell>
              <TableCell>{driver.reassignments}</TableCell>
              <TableCell>{driver.balance}€</TableCell>
              <TableCell>
                <Chip
                  label={driver.status}
                  color={
                    driver.status === 'ACTIVE'
                      ? 'success'
                      : driver.status === 'WARNING'
                      ? 'warning'
                      : 'error'
                  }
                />
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={(event) => {
                    setSelectedDriver(driver);
                    setAnchorEl(event.currentTarget);
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderDriverMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={() => setAnchorEl(null)}
    >
      <MenuItem onClick={() => setShowDetailsDialog(true)}>
        Voir les détails
      </MenuItem>
      <MenuItem onClick={() => handleDriverAction('suspend')}>
        Suspendre
      </MenuItem>
      <MenuItem onClick={() => handleDriverAction('warn')}>
        Avertir
      </MenuItem>
      <MenuItem onClick={() => handleDriverAction('reset-penalties')}>
        Réinitialiser les pénalités
      </MenuItem>
    </Menu>
  );

  const renderDetailsDialog = () => (
    <Dialog
      open={showDetailsDialog}
      onClose={() => setShowDetailsDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Détails du Chauffeur</DialogTitle>
      <DialogContent>
        {selectedDriver && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6">{selectedDriver.name}</Typography>
            </Grid>
            {/* Ajouter plus de détails ici */}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowDetailsDialog(false)}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Tableau de Bord de la Flotte</Typography>
        <TextField
          select
          label="Période"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          variant="outlined"
          size="small"
        >
          <MenuItem value="7d">7 jours</MenuItem>
          <MenuItem value="30d">30 jours</MenuItem>
          <MenuItem value="90d">90 jours</MenuItem>
          <MenuItem value="365d">1 an</MenuItem>
        </TextField>
      </Box>

      <Box mb={3}>{renderMetricsCards()}</Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          {renderRevenueChart()}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderPerformanceDistribution()}
        </Grid>
      </Grid>

      <Box mb={3}>
        <Typography variant="h5" gutterBottom>
          Liste des Chauffeurs
        </Typography>
        {renderDriversTable()}
      </Box>

      {renderDriverMenu()}
      {renderDetailsDialog()}
    </Box>
  );
};
