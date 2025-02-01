interface Location {
  lat: number;
  lng: number;
}

interface TimeWindow {
  start: string;
  end: string;
}

export interface DeliveryPoint {
  id: string;
  address: string;
  location: Location;
  timeWindow?: TimeWindow;
}

export interface OptimizationRequest {
  deliveryPoints: DeliveryPoint[];
  vehicleCapacity?: number;
  timeConstraints?: boolean;
}

export interface OptimizedRoute {
  waypoints: DeliveryPoint[];
  totalDistance: number;
  totalDuration: number;
  directions: google.maps.DirectionsResult;
}

class RouteOptimizationService {
  private readonly API_URL = '/api/route-optimization';

  async optimizeRoute(request: OptimizationRequest): Promise<OptimizedRoute> {
    try {
      const response = await fetch(`${this.API_URL}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'optimisation de l\'itinéraire');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur dans RouteOptimizationService:', error);
      throw error;
    }
  }

  async getDeliveryPoints(): Promise<DeliveryPoint[]> {
    try {
      const response = await fetch(`${this.API_URL}/delivery-points`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des points de livraison');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur dans RouteOptimizationService:', error);
      throw error;
    }
  }

  calculateOptimalRoute(points: DeliveryPoint[]): Promise<google.maps.DirectionsResult> {
    return new Promise((resolve, reject) => {
      const directionsService = new google.maps.DirectionsService();

      const waypoints = points.slice(1, -1).map(point => ({
        location: new google.maps.LatLng(point.location.lat, point.location.lng),
        stopover: true
      }));

      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(points[0].location.lat, points[0].location.lng),
        destination: new google.maps.LatLng(
          points[points.length - 1].location.lat,
          points[points.length - 1].location.lng
        ),
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          resolve(result);
        } else {
          reject(new Error(`Erreur Direction Service: ${status}`));
        }
      });
    });
  }
}

export const routeOptimizationService = new RouteOptimizationService();
