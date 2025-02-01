import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Vehicle } from '../../types/vehicle';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface VehicleMapProps {
  vehicles: Vehicle[];
  onVehicleSelect: (vehicle: Vehicle) => void;
}

const VehicleMap: React.FC<VehicleMapProps> = ({ vehicles, onVehicleSelect }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('vehicle-map').setView([48.8566, 2.3522], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    // Mise à jour des marqueurs
    vehicles.forEach((vehicle) => {
      if (
        vehicle.tracking?.lastLocation?.latitude &&
        vehicle.tracking?.lastLocation?.longitude
      ) {
        const position: L.LatLngExpression = [
          vehicle.tracking.lastLocation.latitude,
          vehicle.tracking.lastLocation.longitude,
        ];

        if (markersRef.current[vehicle.id]) {
          markersRef.current[vehicle.id].setLatLng(position);
        } else {
          const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div style="
                background-color: ${
                  vehicle.status === 'ACTIVE' ? '#4caf50' : '#ff9800'
                };
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              ">
                <span>${vehicle.registrationNumber.slice(0, 2)}</span>
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });

          const marker = L.marker(position, { icon }).addTo(mapRef.current!);
          marker.bindPopup(`
            <div>
              <h3>${vehicle.registrationNumber}</h3>
              <p>${vehicle.brand} ${vehicle.model}</p>
              <p>Statut: ${vehicle.status}</p>
              <p>Chauffeur: ${
                vehicle.currentDriver?.name || 'Non assigné'
              }</p>
            </div>
          `);
          marker.on('click', () => onVehicleSelect(vehicle));
          markersRef.current[vehicle.id] = marker;
        }
      }
    });

    // Nettoyage des marqueurs obsolètes
    Object.keys(markersRef.current).forEach((vehicleId) => {
      if (!vehicles.find((v) => v.id === vehicleId)) {
        markersRef.current[vehicleId].remove();
        delete markersRef.current[vehicleId];
      }
    });

    // Ajuster la vue pour montrer tous les véhicules
    if (Object.keys(markersRef.current).length > 0) {
      const bounds = L.latLngBounds(
        Object.values(markersRef.current).map((marker) => marker.getLatLng()),
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
      }
    };
  }, [vehicles, onVehicleSelect]);

  return (
    <Paper
      elevation={3}
      sx={{
        height: '600px',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        id="vehicle-map"
        sx={{
          height: '100%',
          width: '100%',
          '& .leaflet-container': {
            height: '100%',
            width: '100%',
          },
        }}
      />
      {vehicles.length === 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" color="textSecondary">
            Aucun véhicule à afficher sur la carte
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default VehicleMap;
