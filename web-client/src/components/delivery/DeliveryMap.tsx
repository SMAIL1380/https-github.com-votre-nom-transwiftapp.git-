'use client';

import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Delivery {
  id: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface DeliveryMapProps {
  deliveries: Delivery[];
}

export default function DeliveryMap({ deliveries }: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
      });

      const google = await loader.load();
      
      if (mapRef.current) {
        // Centre par défaut sur Paris
        const center = { lat: 48.8566, lng: 2.3522 };
        
        googleMapRef.current = new google.maps.Map(mapRef.current, {
          center,
          zoom: 12,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        // Ajouter les marqueurs pour chaque livraison
        deliveries.forEach((delivery) => {
          if (delivery.location) {
            const marker = new google.maps.Marker({
              position: delivery.location,
              map: googleMapRef.current,
              title: `Livraison ${delivery.id}`,
              icon: {
                url: getMarkerIcon(delivery.status),
                scaledSize: new google.maps.Size(30, 30),
              },
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div class="p-2">
                  <p class="font-semibold">Livraison ${delivery.id}</p>
                  <p class="text-sm">Status: ${delivery.status}</p>
                  <p class="text-sm">De: ${delivery.pickupAddress}</p>
                  <p class="text-sm">À: ${delivery.deliveryAddress}</p>
                </div>
              `,
            });

            marker.addListener('click', () => {
              infoWindow.open(googleMapRef.current, marker);
            });

            markersRef.current.push(marker);
          }
        });
      }
    };

    initMap();

    return () => {
      // Nettoyer les marqueurs lors du démontage
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [deliveries]);

  const getMarkerIcon = (status: string): string => {
    switch (status) {
      case 'pending':
        return '/markers/pending.png';
      case 'inProgress':
        return '/markers/in-progress.png';
      case 'delivered':
        return '/markers/delivered.png';
      default:
        return '/markers/default.png';
    }
  };

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg" />
  );
}
