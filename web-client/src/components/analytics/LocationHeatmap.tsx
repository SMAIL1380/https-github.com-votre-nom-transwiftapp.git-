import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { LocationMetrics } from '../../types/analytics';
import './LocationHeatmap.css';

interface LocationHeatmapProps {
  hotspots: LocationMetrics['hotspots'];
  popularRoutes: LocationMetrics['popularRoutes'];
}

declare global {
  interface Window {
    google: any;
  }
}

const LocationHeatmap: React.FC<LocationHeatmapProps> = ({
  hotspots,
  popularRoutes,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const heatmap = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const routeLines = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['visualization'],
      });

      try {
        const google = await loader.load();
        const { Map } = google.maps;
        const { HeatmapLayer } = google.maps.visualization;

        if (!mapRef.current) return;

        // Calculer le centre de la carte basé sur les points chauds
        const bounds = new google.maps.LatLngBounds();
        hotspots.forEach(spot => {
          bounds.extend(new google.maps.LatLng(spot.lat, spot.lng));
        });

        // Créer la carte
        mapInstance.current = new Map(mapRef.current, {
          center: bounds.getCenter(),
          zoom: 12,
          styles: [
            {
              featureType: 'all',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#6B7280' }],
            },
            {
              featureType: 'all',
              elementType: 'labels.text.stroke',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'administrative',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#E5E7EB' }],
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#F3F4F6' }],
            },
            {
              featureType: 'poi',
              elementType: 'geometry',
              stylers: [{ color: '#E5E7EB' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#D1D5DB' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#DBEAFE' }],
            },
          ],
        });

        // Créer la carte de chaleur
        const heatmapData = hotspots.map(spot => ({
          location: new google.maps.LatLng(spot.lat, spot.lng),
          weight: spot.intensity,
        }));

        heatmap.current = new HeatmapLayer({
          data: heatmapData,
          map: mapInstance.current,
          radius: 30,
          gradient: [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)',
          ],
        });

        // Dessiner les routes populaires
        routeLines.current = popularRoutes.map(route => {
          const path = [
            new google.maps.LatLng(route.start.lat, route.start.lng),
            new google.maps.LatLng(route.end.lat, route.end.lng),
          ];

          return new google.maps.Polyline({
            path,
            map: mapInstance.current,
            geodesic: true,
            strokeColor: '#4F46E5',
            strokeOpacity: route.frequency / Math.max(...popularRoutes.map(r => r.frequency)),
            strokeWeight: 2 + (route.frequency / Math.max(...popularRoutes.map(r => r.frequency)) * 4),
          });
        });

        // Ajuster la vue pour inclure toutes les routes
        popularRoutes.forEach(route => {
          bounds.extend(new google.maps.LatLng(route.start.lat, route.start.lng));
          bounds.extend(new google.maps.LatLng(route.end.lat, route.end.lng));
        });

        mapInstance.current.fitBounds(bounds);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la carte:', error);
      }
    };

    initMap();

    return () => {
      // Nettoyer les routes
      routeLines.current.forEach(line => line.setMap(null));
      routeLines.current = [];

      // Nettoyer la carte de chaleur
      if (heatmap.current) {
        heatmap.current.setMap(null);
      }
    };
  }, [hotspots, popularRoutes]);

  return (
    <div className="location-heatmap-container">
      <div className="heatmap-header">
        <h3>Carte d'Activité en Temps Réel</h3>
        <div className="heatmap-legend">
          <div className="legend-item">
            <div className="legend-color low"></div>
            <span>Faible activité</span>
          </div>
          <div className="legend-item">
            <div className="legend-color medium"></div>
            <span>Activité moyenne</span>
          </div>
          <div className="legend-item">
            <div className="legend-color high"></div>
            <span>Forte activité</span>
          </div>
          <div className="legend-item">
            <div className="legend-line"></div>
            <span>Routes populaires</span>
          </div>
        </div>
      </div>
      <div ref={mapRef} className="map-container"></div>
    </div>
  );
};

export default LocationHeatmap;
