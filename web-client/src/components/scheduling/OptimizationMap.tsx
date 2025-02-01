import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { Schedule } from '../../types/schedule';
import { Driver } from '../../types/driver';
import { Vehicle } from '../../types/vehicle';
import { useDeliveries } from '../../hooks/useDeliveries';

interface OptimizationMapProps {
  schedules: Schedule[];
  drivers: Driver[];
  vehicles: Vehicle[];
}

interface RouteColors {
  [key: string]: string;
}

const OptimizationMap: React.FC<OptimizationMapProps> = ({
  schedules,
  drivers,
  vehicles,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const routingControlsRef = useRef<L.Routing.Control[]>([]);
  const { deliveries } = useDeliveries();

  const ROUTE_COLORS: RouteColors = {
    HIGH: '#ff4444',
    NORMAL: '#4444ff',
    LOW: '#44ff44',
  };

  useEffect(() => {
    // Initialisation de la carte
    if (!mapRef.current) {
      mapRef.current = L.map('optimization-map').setView([48.8566, 2.3522], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    // Nettoyage des contrôles de routage existants
    routingControlsRef.current.forEach(control => {
      if (mapRef.current) {
        control.remove();
      }
    });
    routingControlsRef.current = [];

    // Création des routes pour chaque planning
    schedules.forEach(schedule => {
      const scheduleDeliveries = deliveries.filter(delivery =>
        schedule.deliveryIds.includes(delivery.id)
      );

      if (scheduleDeliveries.length > 0) {
        const waypoints = scheduleDeliveries.map(delivery => 
          L.latLng(delivery.latitude, delivery.longitude)
        );

        const driver = drivers.find(d => d.id === schedule.driverId);
        const vehicle = vehicles.find(v => v.id === schedule.vehicleId);

        const routingControl = L.Routing.control({
          waypoints,
          routeWhileDragging: false,
          showAlternatives: false,
          fitSelectedRoutes: true,
          lineOptions: {
            styles: [
              {
                color: ROUTE_COLORS[schedule.priority] || ROUTE_COLORS.NORMAL,
                opacity: 0.8,
                weight: 4,
              },
            ],
          },
          createMarker: (i, waypoint, n) => {
            const delivery = scheduleDeliveries[i];
            const marker = L.marker(waypoint.latLng, {
              icon: L.divIcon({
                className: 'custom-div-icon',
                html: `
                  <div style="background-color: white; padding: 5px; border-radius: 5px; border: 2px solid ${
                    ROUTE_COLORS[schedule.priority] || ROUTE_COLORS.NORMAL
                  }">
                    <div style="font-weight: bold;">${delivery?.reference || `Stop ${i + 1}`}</div>
                    <div style="font-size: 0.8em;">${
                      new Date(schedule.startDate).toLocaleTimeString()
                    }</div>
                  </div>
                `,
                iconSize: [100, 40],
                iconAnchor: [50, 40],
              }),
            });

            marker.bindPopup(`
              <div>
                <h4>${delivery?.reference || `Stop ${i + 1}`}</h4>
                <p><strong>Chauffeur:</strong> ${driver?.name || 'N/A'}</p>
                <p><strong>Véhicule:</strong> ${vehicle?.registrationNumber || 'N/A'}</p>
                <p><strong>Heure prévue:</strong> ${new Date(
                  schedule.startDate
                ).toLocaleTimeString()}</p>
                <p><strong>Adresse:</strong> ${delivery?.destination || 'N/A'}</p>
              </div>
            `);

            return marker;
          },
        });

        if (mapRef.current) {
          routingControl.addTo(mapRef.current);
          routingControlsRef.current.push(routingControl);
        }
      }
    });

    // Nettoyage
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [schedules, drivers, vehicles, deliveries]);

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Visualisation des routes optimisées
      </Typography>
      <Box
        id="optimization-map"
        sx={{
          height: 500,
          width: '100%',
          '& .leaflet-routing-alt': {
            display: 'none',
          },
          '& .leaflet-routing-container': {
            display: 'none',
          },
        }}
      />
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Légende
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {Object.entries(ROUTE_COLORS).map(([priority, color]) => (
            <Box
              key={priority}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 4,
                  backgroundColor: color,
                }}
              />
              <Typography variant="body2">{priority}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default OptimizationMap;
