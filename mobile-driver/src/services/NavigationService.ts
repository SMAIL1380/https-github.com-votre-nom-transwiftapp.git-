import axios from 'axios';
import { Platform, Linking } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { API_URL, GOOGLE_MAPS_API_KEY } from '@env';

interface Location {
  latitude: number;
  longitude: number;
}

interface RouteInfo {
  distance: number;
  duration: number;
  polyline: string;
  steps: Array<{
    distance: number;
    duration: number;
    instructions: string;
    polyline: string;
  }>;
}

class NavigationService {
  private watchId: number | null = null;

  // Obtenir la position actuelle
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }

  // Démarrer le suivi de localisation
  startLocationTracking(onLocationUpdate: (location: Location) => void): void {
    this.watchId = Geolocation.watchPosition(
      position => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        onLocationUpdate(location);
        this.updateLocationOnServer(location);
      },
      error => console.error(error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Mettre à jour tous les 10 mètres
        interval: 5000, // Mettre à jour toutes les 5 secondes
      }
    );
  }

  // Arrêter le suivi de localisation
  stopLocationTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Mettre à jour la position sur le serveur
  private async updateLocationOnServer(location: Location): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/driver/location`,
        location,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error('Failed to update location on server:', error);
    }
  }

  // Calculer l'itinéraire avec Google Maps Directions API
  async calculateRoute(origin: Location, destination: Location): Promise<RouteInfo> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (response.data.status !== 'OK') {
        throw new Error('Failed to calculate route');
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance.value / 1000, // Convert to kilometers
        duration: leg.duration.value / 60, // Convert to minutes
        polyline: route.overview_polyline.points,
        steps: leg.steps.map(step => ({
          distance: step.distance.value / 1000,
          duration: step.duration.value / 60,
          instructions: step.html_instructions,
          polyline: step.polyline.points,
        })),
      };
    } catch (error) {
      console.error('Failed to calculate route:', error);
      throw error;
    }
  }

  // Ouvrir Google Maps pour la navigation
  openGoogleMapsNavigation(destination: Location): void {
    const scheme = Platform.select({
      ios: 'comgooglemaps://',
      android: 'google.navigation:q=',
    });
    const url = Platform.select({
      ios: `${scheme}?daddr=${destination.latitude},${destination.longitude}&directionsmode=driving`,
      android: `${scheme}${destination.latitude},${destination.longitude}`,
    });

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback vers Google Maps web si l'application n'est pas installée
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=driving`
        );
      }
    });
  }

  // Calculer la distance entre deux points
  calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    const lat1 = this.toRad(point1.latitude);
    const lat2 = this.toRad(point2.latitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  // Vérifier si le chauffeur est proche du point de destination
  isNearDestination(currentLocation: Location, destination: Location, threshold: number = 0.1): boolean {
    const distance = this.calculateDistance(currentLocation, destination);
    return distance <= threshold; // threshold en kilomètres
  }

  // Optimiser l'itinéraire pour plusieurs points de livraison
  async optimizeRoute(deliveryPoints: Location[]): Promise<Location[]> {
    try {
      const currentLocation = await this.getCurrentLocation();
      const response = await axios.post(
        `${API_URL}/api/navigation/optimize-route`,
        {
          origin: currentLocation,
          destinations: deliveryPoints,
        }
      );
      return response.data.optimizedRoute;
    } catch (error) {
      console.error('Failed to optimize route:', error);
      throw error;
    }
  }
}

export default new NavigationService();
