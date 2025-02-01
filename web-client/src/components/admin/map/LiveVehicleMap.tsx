import React, { useState, useEffect } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  Polyline,
} from '@react-google-maps/api';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  LocalShipping as TruckIcon,
  Schedule as TimeIcon,
  Room as LocationIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const mapContainerStyle = {
  width: '100%',
  height: '700px',
};

const center = {
  lat: 48.8566, // Paris
  lng: 2.3522,
};

interface Vehicle {
  id: string;
  registrationNumber: string;
  isInternal: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
  };
  currentOrder?: {
    id: string;
    status: string;
    pickupLocation: {
      latitude: number;
      longitude: number;
    };
    deliveryLocation: {
      latitude: number;
      longitude: number;
    };
  };
  driver: {
    firstName: string;
    lastName: string;
  };
  type: {
    name: string;
  };
}

export const LiveVehicleMap: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [routePolylines, setRoutePolylines] = useState<{ [key: string]: string }>(
    {},
  );

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles/live-locations');
        const data = await response.json();
        setVehicles(data);

        // Récupérer les itinéraires pour les véhicules en livraison
        const polylines: { [key: string]: string } = {};
        for (const vehicle of data) {
          if (vehicle.currentOrder) {
            const routeResponse = await fetch(
              `/api/vehicles/${vehicle.id}/current-route`,
            );
            const routeData = await routeResponse.json();
            polylines[vehicle.id] = routeData.polyline;
          }
        }
        setRoutePolylines(polylines);
      } catch (error) {
        console.error('Erreur lors de la récupération des véhicules:', error);
      }
    };

    fetchVehicles();
    const interval = setInterval(fetchVehicles, 30000); // Mise à jour toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  const getMarkerIcon = (vehicle: Vehicle) => {
    return {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: vehicle.isInternal ? '#2196f3' : '#ff9800',
      fillOpacity: 1,
      strokeWeight: 2,
      rotation: vehicle.currentLocation.heading || 0,
      scale: 7,
    };
  };

  const renderVehicleInfo = (vehicle: Vehicle) => (
    <Card sx={{ minWidth: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {vehicle.registrationNumber}
          <Chip
            size="small"
            label={vehicle.isInternal ? 'Interne' : 'Externe'}
            color={vehicle.isInternal ? 'primary' : 'default'}
            sx={{ ml: 1 }}
          />
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <TruckIcon />
            </ListItemIcon>
            <ListItemText
              primary={vehicle.type.name}
              secondary={`${vehicle.driver.firstName} ${vehicle.driver.lastName}`}
            />
          </ListItem>

          {vehicle.currentLocation.speed && (
            <ListItem>
              <ListItemIcon>
                <SpeedIcon />
              </ListItemIcon>
              <ListItemText
                primary="Vitesse"
                secondary={`${Math.round(vehicle.currentLocation.speed)} km/h`}
              />
            </ListItem>
          )}

          {vehicle.currentOrder && (
            <>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Commande en cours"
                  secondary={`#${vehicle.currentOrder.id}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TimeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Statut"
                  secondary={vehicle.currentOrder.status}
                />
              </ListItem>
            </>
          )}
        </List>
      </CardContent>
    </Card>
  );

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <Box sx={{ position: 'relative', height: '100%' }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
          options={{
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          }}
        >
          {vehicles.map((vehicle) => (
            <React.Fragment key={vehicle.id}>
              <Marker
                position={{
                  lat: vehicle.currentLocation.latitude,
                  lng: vehicle.currentLocation.longitude,
                }}
                icon={getMarkerIcon(vehicle)}
                onClick={() => setSelectedVehicle(vehicle)}
              />

              {vehicle.currentOrder && routePolylines[vehicle.id] && (
                <Polyline
                  path={google.maps.geometry.encoding.decodePath(
                    routePolylines[vehicle.id],
                  )}
                  options={{
                    strokeColor: vehicle.isInternal ? '#2196f3' : '#ff9800',
                    strokeWeight: 3,
                    strokeOpacity: 0.8,
                  }}
                />
              )}
            </React.Fragment>
          ))}

          {selectedVehicle && (
            <InfoWindow
              position={{
                lat: selectedVehicle.currentLocation.latitude,
                lng: selectedVehicle.currentLocation.longitude,
              }}
              onCloseClick={() => setSelectedVehicle(null)}
            >
              {renderVehicleInfo(selectedVehicle)}
            </InfoWindow>
          )}
        </GoogleMap>

        <Paper
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            p: 2,
            maxWidth: 300,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Légende
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: '#2196f3',
                borderRadius: '50%',
                mr: 1,
              }}
            />
            <Typography variant="body2">Véhicules Internes</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: '#ff9800',
                borderRadius: '50%',
                mr: 1,
              }}
            />
            <Typography variant="body2">Véhicules Externes</Typography>
          </Box>
        </Paper>
      </Box>
    </LoadScript>
  );
};
