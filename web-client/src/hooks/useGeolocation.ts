import { useState, useEffect } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface GeolocationState {
  location: Location | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState(prev => ({
        ...prev,
        error: 'La géolocalisation n\'est pas supportée par votre navigateur',
        isLoading: false,
      }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error: getGeolocationErrorMessage(error),
          isLoading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return state;
}

function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'L\'accès à la géolocalisation a été refusé';
    case error.POSITION_UNAVAILABLE:
      return 'Les informations de géolocalisation ne sont pas disponibles';
    case error.TIMEOUT:
      return 'La demande de géolocalisation a expiré';
    default:
      return 'Une erreur inconnue est survenue';
  }
}
