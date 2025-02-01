import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Chip,
  IconButton,
  Divider,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Build as BuildIcon,
  LocalGasStation as FuelIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { Vehicle, MaintenanceRecord } from '../../types/vehicle';
import MaintenanceHistory from './MaintenanceHistory';
import FuelHistory from './FuelHistory';
import VehicleTracking from './VehicleTracking';

interface VehicleDetailsProps {
  vehicle: Vehicle;
  onBack: () => void;
  onEdit: (vehicle: Vehicle) => void;
}

const VehicleDetails: React.FC<VehicleDetailsProps> = ({
  vehicle,
  onBack,
  onEdit,
}) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Détails du véhicule</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => onEdit(vehicle)}
        >
          Modifier
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Informations générales"
              action={
                <Chip
                  label={vehicle.status}
                  color={
                    vehicle.status === 'ACTIVE'
                      ? 'success'
                      : vehicle.status === 'MAINTENANCE'
                      ? 'warning'
                      : 'error'
                  }
                />
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Immatriculation
                  </Typography>
                  <Typography variant="body1">
                    {vehicle.registrationNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Modèle
                  </Typography>
                  <Typography variant="body1">
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Type de carburant
                  </Typography>
                  <Typography variant="body1">{vehicle.fuelType}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Capacité
                  </Typography>
                  <Typography variant="body1">{vehicle.capacity} kg</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="État actuel" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FuelIcon sx={{ mr: 1 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Niveau de carburant
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={vehicle.fuelLevel}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {vehicle.fuelLevel}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Kilométrage
                  </Typography>
                  <Typography variant="body1">
                    {vehicle.mileage.toLocaleString()} km
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Dernière maintenance
                  </Typography>
                  <Typography variant="body1">
                    {vehicle.maintenanceHistory?.length > 0
                      ? new Date(
                          vehicle.maintenanceHistory[
                            vehicle.maintenanceHistory.length - 1
                          ].date,
                        ).toLocaleDateString()
                      : 'Aucune'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab
                  icon={<BuildIcon />}
                  label="Maintenance"
                  id="vehicle-tab-0"
                />
                <Tab
                  icon={<FuelIcon />}
                  label="Carburant"
                  id="vehicle-tab-1"
                />
                <Tab
                  icon={<TimelineIcon />}
                  label="Suivi"
                  id="vehicle-tab-2"
                />
              </Tabs>

              <Box sx={{ mt: 2 }}>
                {tabValue === 0 && (
                  <MaintenanceHistory
                    maintenanceHistory={vehicle.maintenanceHistory}
                    vehicleId={vehicle.id}
                  />
                )}
                {tabValue === 1 && (
                  <FuelHistory
                    fuelHistory={vehicle.fuelHistory}
                    vehicleId={vehicle.id}
                  />
                )}
                {tabValue === 2 && (
                  <VehicleTracking
                    tracking={vehicle.tracking}
                    vehicleId={vehicle.id}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VehicleDetails;
