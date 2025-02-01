import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Timeline as TimelineIcon,
  Route as RouteIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { Schedule } from '../../types/schedule';
import { Driver } from '../../types/driver';
import { Vehicle } from '../../types/vehicle';
import { optimizeRoutes } from '../../services/optimizationService';
import OptimizationMap from './OptimizationMap';

interface ScheduleOptimizationProps {
  schedules: Schedule[];
  drivers: Driver[];
  vehicles: Vehicle[];
  onOptimize: (optimizedSchedules: Schedule[]) => void;
  onCancel: () => void;
}

interface OptimizationMetrics {
  totalDistance: number;
  totalDuration: number;
  fuelConsumption: number;
  co2Emissions: number;
  driverUtilization: { [key: string]: number };
  vehicleUtilization: { [key: string]: number };
}

const ScheduleOptimization: React.FC<ScheduleOptimizationProps> = ({
  schedules,
  drivers,
  vehicles,
  onOptimize,
  onCancel,
}) => {
  const [optimizing, setOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [optimizedSchedules, setOptimizedSchedules] = useState<Schedule[]>([]);
  const [metrics, setMetrics] = useState<OptimizationMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateMetrics = (schedules: Schedule[]) => {
    // Simulation des métriques d'optimisation
    const metrics: OptimizationMetrics = {
      totalDistance: 0,
      totalDuration: 0,
      fuelConsumption: 0,
      co2Emissions: 0,
      driverUtilization: {},
      vehicleUtilization: {},
    };

    schedules.forEach(schedule => {
      // Calcul de la distance et de la durée
      const duration = new Date(schedule.endDate).getTime() - new Date(schedule.startDate).getTime();
      metrics.totalDuration += duration;

      // Simulation de la distance basée sur les livraisons
      const distance = schedule.deliveryIds.length * 10; // 10km par livraison en moyenne
      metrics.totalDistance += distance;

      // Calcul de la consommation de carburant et des émissions
      const vehicle = vehicles.find(v => v.id === schedule.vehicleId);
      if (vehicle) {
        const fuelConsumption = distance * (vehicle.fuelConsumption || 0.1); // L/km
        metrics.fuelConsumption += fuelConsumption;
        metrics.co2Emissions += fuelConsumption * 2.5; // kg CO2/L
      }

      // Calcul de l'utilisation des chauffeurs et véhicules
      metrics.driverUtilization[schedule.driverId] = (metrics.driverUtilization[schedule.driverId] || 0) + duration;
      metrics.vehicleUtilization[schedule.vehicleId] = (metrics.vehicleUtilization[schedule.vehicleId] || 0) + duration;
    });

    return metrics;
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    setError(null);
    setProgress(0);
    setCurrentStep('Analyse des planifications actuelles...');

    try {
      // Simulation du processus d'optimisation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(20);
      setCurrentStep('Calcul des routes optimales...');

      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgress(50);
      setCurrentStep('Application des contraintes de temps...');

      const optimized = await optimizeRoutes(schedules, drivers, vehicles);
      setOptimizedSchedules(optimized);

      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(80);
      setCurrentStep('Calcul des métriques...');

      const newMetrics = calculateMetrics(optimized);
      setMetrics(newMetrics);

      setProgress(100);
      setCurrentStep('Optimisation terminée');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setOptimizing(false);
    }
  };

  const renderMetrics = () => {
    if (!metrics) return null;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Métriques globales
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Distance totale"
                    secondary={`${Math.round(metrics.totalDistance)} km`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Durée totale"
                    secondary={`${Math.round(metrics.totalDuration / (1000 * 60 * 60))} heures`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Consommation de carburant"
                    secondary={`${Math.round(metrics.fuelConsumption)} L`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Émissions CO2"
                    secondary={`${Math.round(metrics.co2Emissions)} kg`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Utilisation des ressources
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Chauffeurs
                </Typography>
                {Object.entries(metrics.driverUtilization).map(([driverId, duration]) => {
                  const driver = drivers.find(d => d.id === driverId);
                  return (
                    <Box key={driverId} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {driver?.name} - {Math.round((duration / (1000 * 60 * 60)))} heures
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((duration / (1000 * 60 * 60 * 8)) * 100, 100)}
                      />
                    </Box>
                  );
                })}
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Véhicules
                </Typography>
                {Object.entries(metrics.vehicleUtilization).map(([vehicleId, duration]) => {
                  const vehicle = vehicles.find(v => v.id === vehicleId);
                  return (
                    <Box key={vehicleId} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {vehicle?.registrationNumber} - {Math.round((duration / (1000 * 60 * 60)))} heures
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((duration / (1000 * 60 * 60 * 8)) * 100, 100)}
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <>
      <DialogTitle>Optimisation du planning</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {optimizing && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {currentStep}
            </Typography>
          </Box>
        )}

        {!optimizing && !metrics && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" paragraph>
              L'optimisation du planning va:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Optimiser les routes"
                  secondary="Réduire les distances parcourues et la consommation de carburant"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Équilibrer la charge de travail"
                  secondary="Répartir équitablement les livraisons entre les chauffeurs"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Respecter les contraintes"
                  secondary="Temps de travail, pauses, et spécifications des véhicules"
                />
              </ListItem>
            </List>
          </Box>
        )}

        {metrics && renderMetrics()}

        {metrics && optimizedSchedules.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <OptimizationMap
              schedules={optimizedSchedules}
              drivers={drivers}
              vehicles={vehicles}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>
          Annuler
        </Button>
        {!optimizing && !metrics && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOptimize}
            startIcon={<TimelineIcon />}
          >
            Optimiser
          </Button>
        )}
        {metrics && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onOptimize(optimizedSchedules)}
            startIcon={<CheckIcon />}
          >
            Appliquer l'optimisation
          </Button>
        )}
      </DialogActions>
    </>
  );
};

export default ScheduleOptimization;
