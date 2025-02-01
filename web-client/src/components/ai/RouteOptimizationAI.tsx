import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Route as RouteIcon,
  TrendingUp as TrendingUpIcon,
  LocalGasStation as FuelIcon,
  Co2 as EmissionIcon,
  Schedule as TimeIcon,
  Speed as EfficiencyIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Schedule } from '../../types/schedule';
import { Driver } from '../../types/driver';
import { Vehicle } from '../../types/vehicle';
import { useAIOptimization } from '../../hooks/useAIOptimization';
import AIRouteMap from './AIRouteMap';
import AIMetricsChart from './AIMetricsChart';
import AIRecommendations from './AIRecommendations';

interface RouteOptimizationAIProps {
  schedules: Schedule[];
  drivers: Driver[];
  vehicles: Vehicle[];
  onOptimize: (optimizedSchedules: Schedule[]) => void;
  onClose: () => void;
}

const RouteOptimizationAI: React.FC<RouteOptimizationAIProps> = ({
  schedules,
  drivers,
  vehicles,
  onOptimize,
  onClose,
}) => {
  const {
    optimizedRoutes,
    metrics,
    recommendations,
    isOptimizing,
    progress,
    currentPhase,
    error,
    startOptimization,
    applyRecommendation,
    saveOptimization,
  } = useAIOptimization();

  const [showDetails, setShowDetails] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    // Initialisation de l'optimisation
    startOptimization(schedules, drivers, vehicles);
  }, []);

  const renderProgress = () => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {currentPhase}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {progress}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
        }}
      />
    </Box>
  );

  const renderMetrics = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {metrics && (
        <>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <RouteIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Distance</Typography>
                </Box>
                <Typography variant="h4">
                  {Math.round(metrics.savings.distance)} km
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  -{Math.round(metrics.savings.distance / metrics.totalDistance * 100)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TimeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Temps</Typography>
                </Box>
                <Typography variant="h4">
                  {Math.round(metrics.savings.duration)} h
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  -{Math.round(metrics.savings.duration / metrics.totalDuration * 100)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FuelIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Carburant</Typography>
                </Box>
                <Typography variant="h4">
                  {Math.round(metrics.savings.fuel)} L
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  -{Math.round(metrics.savings.fuel / metrics.fuelConsumption * 100)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmissionIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">CO2</Typography>
                </Box>
                <Typography variant="h4">
                  {Math.round(metrics.savings.co2)} kg
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  -{Math.round(metrics.savings.co2 / metrics.co2Emissions * 100)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );

  const renderRecommendations = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Recommandations IA</Typography>
        </Box>
        <List>
          {recommendations?.map((recommendation, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => applyRecommendation(recommendation)}
                >
                  Appliquer
                </Button>
              }
            >
              <ListItemIcon>
                <EfficiencyIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={recommendation.description}
                secondary={`Impact: ${recommendation.impact.value} ${recommendation.impact.unit}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  return (
    <>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TimelineIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Optimisation IA des routes</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={() => setShowDetails(!showDetails)}>
            <InfoIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isOptimizing ? (
          renderProgress()
        ) : (
          <>
            {renderMetrics()}
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <AIRouteMap
                  originalRoutes={schedules}
                  optimizedRoutes={optimizedRoutes}
                  drivers={drivers}
                  vehicles={vehicles}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                {renderRecommendations()}
                
                <AIMetricsChart
                  metrics={metrics}
                  selectedMetric={selectedMetric}
                  onMetricSelect={setSelectedMetric}
                />
              </Grid>
            </Grid>

            {showDetails && (
              <AIRecommendations
                recommendations={recommendations}
                metrics={metrics}
                onApply={applyRecommendation}
              />
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => startOptimization(schedules, drivers, vehicles)}
          disabled={isOptimizing}
        >
          Réoptimiser
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={() => {
            if (optimizedRoutes) {
              onOptimize(optimizedRoutes);
            }
          }}
          disabled={isOptimizing || !optimizedRoutes}
        >
          Appliquer l'optimisation
        </Button>
      </DialogActions>
    </>
  );
};

export default RouteOptimizationAI;
