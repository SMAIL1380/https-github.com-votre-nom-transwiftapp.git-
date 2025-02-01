import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CompareArrows as CompareIcon,
  Map as MapIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { Schedule } from '../../types/schedule';
import { Driver } from '../../types/driver';
import { Vehicle } from '../../types/vehicle';
import { useDeliveries } from '../../hooks/useDeliveries';

interface AIRouteMapProps {
  originalRoutes: Schedule[];
  optimizedRoutes: Schedule[] | null;
  drivers: Driver[];
  vehicles: Vehicle[];
}

const AIRouteMap: React.FC<AIRouteMapProps> = ({
  originalRoutes,
  optimizedRoutes,
  drivers,
  vehicles,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const originalLayerRef = useRef<L.LayerGroup | null>(null);
  const optimizedLayerRef = useRef<L.LayerGroup | null>(null);
  const { deliveries } = useDeliveries();
  const [viewMode, setViewMode] = useState<'split' | 'comparison'>('split');
  const [activeLayer, setActiveLayer] = useState<'original' | 'optimized' | 'both'>('both');

  const ROUTE_COLORS = {
    ORIGINAL: '#ff4444',
    OPTIMIZED: '#44ff44',
  };

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('ai-route-map', {
        center: [48.8566, 2.3522],
        zoom: 12,
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
          }),
        ],
      });

      originalLayerRef.current = L.layerGroup().addTo(mapRef.current);
      optimizedLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !originalLayerRef.current || !optimizedLayerRef.current) return;

    // Nettoyer les couches existantes
    originalLayerRef.current.clearLayers();
    optimizedLayerRef.current.clearLayers();

    // Dessiner les routes originales
    originalRoutes.forEach(schedule => {
      const scheduleDeliveries = deliveries.filter(d => schedule.deliveryIds.includes(d.id));
      if (scheduleDeliveries.length > 0) {
        drawRoute(scheduleDeliveries, schedule, 'original');
      }
    });

    // Dessiner les routes optimisées
    if (optimizedRoutes) {
      optimizedRoutes.forEach(schedule => {
        const scheduleDeliveries = deliveries.filter(d => schedule.deliveryIds.includes(d.id));
        if (scheduleDeliveries.length > 0) {
          drawRoute(scheduleDeliveries, schedule, 'optimized');
        }
      });
    }

    // Ajuster la vue
    const bounds = L.latLngBounds([]);
    deliveries.forEach(delivery => {
      bounds.extend([delivery.latitude, delivery.longitude]);
    });
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  }, [originalRoutes, optimizedRoutes, deliveries, viewMode, activeLayer]);

  const drawRoute = (
    routeDeliveries: any[],
    schedule: Schedule,
    type: 'original' | 'optimized'
  ) => {
    if (!mapRef.current || !originalLayerRef.current || !optimizedLayerRef.current) return;

    const waypoints = routeDeliveries.map(delivery =>
      L.latLng(delivery.latitude, delivery.longitude)
    );

    const driver = drivers.find(d => d.id === schedule.driverId);
    const vehicle = vehicles.find(v => v.id === schedule.vehicleId);

    const routingControl = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: false,
      lineOptions: {
        styles: [
          {
            color: ROUTE_COLORS[type.toUpperCase()],
            opacity: type === 'optimized' ? 0.8 : 0.5,
            weight: type === 'optimized' ? 5 : 3,
          },
        ],
      },
      createMarker: (i, waypoint) => {
        const delivery = routeDeliveries[i];
        return L.marker(waypoint.latLng, {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div style="
                background-color: white;
                padding: 5px;
                border-radius: 5px;
                border: 2px solid ${ROUTE_COLORS[type.toUpperCase()]};
                ${type === 'optimized' ? 'font-weight: bold;' : ''}
              ">
                <div>${delivery.reference}</div>
                <div style="font-size: 0.8em;">
                  ${new Date(schedule.startDate).toLocaleTimeString()}
                </div>
              </div>
            `,
            iconSize: [100, 40],
            iconAnchor: [50, 40],
          }),
        }).bindPopup(`
          <div>
            <h4>${delivery.reference}</h4>
            <p><strong>Chauffeur:</strong> ${driver?.name || 'N/A'}</p>
            <p><strong>Véhicule:</strong> ${vehicle?.registrationNumber || 'N/A'}</p>
            <p><strong>Heure:</strong> ${new Date(schedule.startDate).toLocaleTimeString()}</p>
            <p><strong>Adresse:</strong> ${delivery.destination}</p>
          </div>
        `);
      },
    });

    const layer = type === 'original' ? originalLayerRef.current : optimizedLayerRef.current;
    routingControl.addTo(layer);
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'split' | 'comparison'
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleLayerChange = (
    event: React.MouseEvent<HTMLElement>,
    newLayer: 'original' | 'optimized' | 'both'
  ) => {
    if (newLayer !== null) {
      setActiveLayer(newLayer);
      if (originalLayerRef.current && optimizedLayerRef.current) {
        if (newLayer === 'original' || newLayer === 'both') {
          originalLayerRef.current.addTo(mapRef.current!);
        } else {
          mapRef.current!.removeLayer(originalLayerRef.current);
        }
        if (newLayer === 'optimized' || newLayer === 'both') {
          optimizedLayerRef.current.addTo(mapRef.current!);
        } else {
          mapRef.current!.removeLayer(optimizedLayerRef.current);
        }
      }
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MapIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Visualisation des routes</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="split">
              <Tooltip title="Vue séparée">
                <LayersIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="comparison">
              <Tooltip title="Comparaison">
                <CompareIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box
          id="ai-route-map"
          sx={{
            height: 500,
            width: '100%',
            position: 'relative',
            '& .leaflet-routing-alt': { display: 'none' },
            '& .leaflet-routing-container': { display: 'none' },
          }}
        />

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <ToggleButtonGroup
            value={activeLayer}
            exclusive
            onChange={handleLayerChange}
            size="small"
          >
            <ToggleButton value="original">
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: ROUTE_COLORS.ORIGINAL,
                  borderRadius: '50%',
                  mr: 1,
                }}
              />
              Original
            </ToggleButton>
            <ToggleButton value="optimized">
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: ROUTE_COLORS.OPTIMIZED,
                  borderRadius: '50%',
                  mr: 1,
                }}
              />
              Optimisé
            </ToggleButton>
            <ToggleButton value="both">
              <CompareIcon sx={{ mr: 1 }} />
              Les deux
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AIRouteMap;
