'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { socket } from '@/lib/socket';

interface Location {
  lat: number;
  lng: number;
}

interface NavigationMapProps {
  pickupLocation: Location;
  deliveryLocation: Location;
  onLocationUpdate?: (location: Location) => void;
}

export default function NavigationMap({
  pickupLocation,
  deliveryLocation,
  onLocationUpdate,
}: NavigationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [distance, setDistance] = useState<string>('');

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places', 'directions'],
      });

      const google = await loader.load();
      
      if (mapRef.current) {
        // Initialiser la carte
        googleMapRef.current = new google.maps.Map(mapRef.current, {
          zoom: 15,
          center: pickupLocation,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        });

        // Initialiser le renderer de directions
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          map: googleMapRef.current,
          suppressMarkers: true,
        });

        // Créer les marqueurs
        new google.maps.Marker({
          position: pickupLocation,
          map: googleMapRef.current,
          icon: {
            url: '/markers/pickup.png',
            scaledSize: new google.maps.Size(40, 40),
          },
        });

        new google.maps.Marker({
          position: deliveryLocation,
          map: googleMapRef.current,
          icon: {
            url: '/markers/delivery.png',
            scaledSize: new google.maps.Size(40, 40),
          },
        });

        // Marqueur pour la position actuelle
        markerRef.current = new google.maps.Marker({
          map: googleMapRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        // Commencer le suivi de localisation
        startLocationTracking();
      }
    };

    initMap();

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [pickupLocation, deliveryLocation]);

  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setCurrentLocation(newLocation);
          updateMarkerPosition(newLocation);
          calculateRoute(newLocation);
          
          // Envoyer la mise à jour de position
          if (onLocationUpdate) {
            onLocationUpdate(newLocation);
          }
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
    }
  };

  const updateMarkerPosition = (location: Location) => {
    if (markerRef.current && googleMapRef.current) {
      markerRef.current.setPosition(location);
      googleMapRef.current.panTo(location);
    }
  };

  const calculateRoute = async (currentPos: Location) => {
    if (!googleMapRef.current || !directionsRendererRef.current) return;

    const directionsService = new google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: currentPos,
        destination: deliveryLocation,
        waypoints: currentLocation ? [] : [{ location: pickupLocation }],
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      });

      directionsRendererRef.current.setDirections(result);

      // Mettre à jour les informations de trajet
      const route = result.routes[0];
      if (route && route.legs[0]) {
        setDistance(route.legs[0].distance?.text || '');
        setEstimatedTime(route.legs[0].duration?.text || '');
      }
    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error);
    }
  };

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Panneau d'informations */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">
            Distance: {distance}
          </p>
          <p className="text-sm font-medium text-gray-900">
            Temps estimé: {estimatedTime}
          </p>
        </div>
      </div>
    </div>
  );
}
