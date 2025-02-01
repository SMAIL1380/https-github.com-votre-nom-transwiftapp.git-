import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Delivery } from '../../types/delivery';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

interface DeliveryMapProps {
  deliveries: Delivery[];
  onDeliverySelect: (delivery: Delivery) => void;
  showRoute?: boolean;
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  deliveries,
  onDeliverySelect,
  showRoute = false,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('delivery-map').setView([48.8566, 2.3522], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    // Nettoyage des marqueurs existants
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (routingControlRef.current) {
      routingControlRef.current.remove();
      routingControlRef.current = null;
    }

    // Ajout des marqueurs pour chaque livraison
    deliveries.forEach((delivery) => {
      // Fonction pour créer un marqueur avec une icône personnalisée
      const createMarker = async (
        address: string,
        isPickup: boolean,
      ): Promise<L.Marker | null> => {
        try {
          // Utilisation de l'API Nominatim pour la géocodification
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              address,
            )}`,
          );
          const data = await response.json();

          if (data && data[0]) {
            const position: L.LatLngExpression = [
              parseFloat(data[0].lat),
              parseFloat(data[0].lon),
            ];

            const icon = L.divIcon({
              className: 'custom-div-icon',
              html: `
                <div style="
                  background-color: ${isPickup ? '#4caf50' : '#f44336'};
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
                  <span>${isPickup ? 'P' : 'D'}</span>
                </div>
              `,
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            });

            const marker = L.marker(position, { icon }).addTo(mapRef.current!);
            marker.bindPopup(`
              <div>
                <h3>${isPickup ? 'Point de ramassage' : 'Point de livraison'}</h3>
                <p>Livraison: ${delivery.trackingNumber}</p>
                <p>Adresse: ${address}</p>
                <p>Statut: ${delivery.status}</p>
              </div>
            `);
            marker.on('click', () => onDeliverySelect(delivery));

            return marker;
          }
          return null;
        } catch (error) {
          console.error('Erreur lors du géocodage:', error);
          return null;
        }
      };

      // Création des marqueurs pour les points de ramassage et de livraison
      Promise.all([
        createMarker(delivery.pickupAddress, true),
        createMarker(delivery.deliveryAddress, false),
      ]).then(([pickupMarker, deliveryMarker]) => {
        if (pickupMarker && deliveryMarker) {
          markersRef.current[`pickup-${delivery.id}`] = pickupMarker;
          markersRef.current[`delivery-${delivery.id}`] = deliveryMarker;

          // Si showRoute est true et qu'il n'y a qu'une seule livraison, afficher l'itinéraire
          if (showRoute && deliveries.length === 1) {
            const pickupLatLng = pickupMarker.getLatLng();
            const deliveryLatLng = deliveryMarker.getLatLng();

            routingControlRef.current = L.Routing.control({
              waypoints: [
                L.latLng(pickupLatLng.lat, pickupLatLng.lng),
                L.latLng(deliveryLatLng.lat, deliveryLatLng.lng),
              ],
              routeWhileDragging: false,
              addWaypoints: false,
              draggableWaypoints: false,
              fitSelectedRoutes: true,
            }).addTo(mapRef.current!);
          }

          // Ajuster la vue pour montrer tous les marqueurs
          const bounds = L.latLngBounds(
            Object.values(markersRef.current).map((marker) =>
              marker.getLatLng(),
            ),
          );
          mapRef.current?.fitBounds(bounds, { padding: [50, 50] });
        }
      });
    });

    return () => {
      if (mapRef.current && !showRoute) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
        if (routingControlRef.current) {
          routingControlRef.current.remove();
          routingControlRef.current = null;
        }
      }
    };
  }, [deliveries, onDeliverySelect, showRoute]);

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
        id="delivery-map"
        sx={{
          height: '100%',
          width: '100%',
          '& .leaflet-container': {
            height: '100%',
            width: '100%',
          },
        }}
      />
      {deliveries.length === 0 && (
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
            Aucune livraison à afficher sur la carte
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DeliveryMap;
