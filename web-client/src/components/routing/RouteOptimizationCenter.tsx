import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '600px'
};

const center = {
  lat: 48.8566, // Paris coordinates
  lng: 2.3522
};

interface DeliveryPoint {
  id: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  timeWindow?: {
    start: string;
    end: string;
  };
}

const RouteOptimizationCenter: React.FC = () => {
  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      setError('Erreur: Clé API Google Maps non configurée');
      console.error('La clé API Google Maps n\'est pas définie dans le fichier .env');
    }
  }, []);

  useEffect(() => {
    loadDeliveryPoints();
  }, []);

  // Fonction pour charger les points de livraison
  const loadDeliveryPoints = async () => {
    try {
      setIsLoading(true);
      // TODO: Appel API pour récupérer les points de livraison
      const response = await fetch('/api/delivery-points');
      const data = await response.json();
      setDeliveryPoints(data);
    } catch (err) {
      setError('Erreur lors du chargement des points de livraison');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour optimiser l'itinéraire
  const optimizeRoute = async () => {
    if (deliveryPoints.length < 2) return;

    const directionsService = new google.maps.DirectionsService();
    
    const waypoints = deliveryPoints.slice(1, -1).map(point => ({
      location: new google.maps.LatLng(point.location.lat, point.location.lng),
      stopover: true
    }));

    const request = {
      origin: new google.maps.LatLng(deliveryPoints[0].location.lat, deliveryPoints[0].location.lng),
      destination: new google.maps.LatLng(
        deliveryPoints[deliveryPoints.length - 1].location.lat,
        deliveryPoints[deliveryPoints.length - 1].location.lng
      ),
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        setDirections(result);
      } else {
        setError('Erreur lors de l'optimisation de l'itinéraire');
      }
    });
  };

  return (
    <div className="route-optimization-center">
      <h2>Centre d'Optimisation des Itinéraires</h2>
      
      {isLoading && <div>Chargement...</div>}
      {error && <div className="error">{error}</div>}

      <div className="map-container">
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
          >
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: false,
                  polylineOptions: {
                    strokeColor: '#2196F3',
                    strokeWeight: 4
                  }
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      <div className="controls">
        <button 
          onClick={optimizeRoute}
          disabled={deliveryPoints.length < 2 || isLoading}
        >
          Optimiser l'itinéraire
        </button>
      </div>

      <div className="delivery-points-list">
        <h3>Points de livraison</h3>
        {deliveryPoints.map((point) => (
          <div key={point.id} className="delivery-point">
            <span>{point.address}</span>
            {point.timeWindow && (
              <span className="time-window">
                {point.timeWindow.start} - {point.timeWindow.end}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteOptimizationCenter;
