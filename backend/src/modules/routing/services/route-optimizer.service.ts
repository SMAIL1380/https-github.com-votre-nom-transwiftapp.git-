import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Client } from '@googlemaps/google-maps-services-js';
import { DeliveryService } from '../../delivery/services/delivery.service';
import { DriverService } from '../../drivers/services/driver.service';
import { Location } from '../../common/interfaces/location.interface';

interface OptimizationParams {
  driverId: string;
  startLocation: Location;
  deliveries: Array<{
    id: string;
    pickupLocation: Location;
    deliveryLocation: Location;
    timeWindow?: {
      start: Date;
      end: Date;
    };
    priority?: number;
  }>;
  vehicleCapacity?: number;
  maxWorkingHours?: number;
}

interface RouteStop {
  deliveryId: string;
  type: 'pickup' | 'delivery';
  location: Location;
  estimatedArrival: Date;
  estimatedDeparture: Date;
}

interface OptimizedRoute {
  driverId: string;
  totalDistance: number;
  totalDuration: number;
  stops: RouteStop[];
  polyline: string;
}

@Injectable()
export class RouteOptimizerService {
  private readonly mapsClient: Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly deliveryService: DeliveryService,
    private readonly driverService: DriverService,
  ) {
    this.mapsClient = new Client({});
  }

  async optimizeRoute(params: OptimizationParams): Promise<OptimizedRoute> {
    try {
      // 1. Préparer les données pour l'optimisation
      const locations = this.prepareLocations(params);
      
      // 2. Calculer la matrice de distance
      const distanceMatrix = await this.calculateDistanceMatrix(locations);
      
      // 3. Appliquer l'algorithme d'optimisation
      const optimizedStops = await this.optimizeStops(params, distanceMatrix);
      
      // 4. Calculer l'itinéraire détaillé
      const routeDetails = await this.calculateDetailedRoute(optimizedStops);
      
      // 5. Créer la réponse optimisée
      return {
        driverId: params.driverId,
        totalDistance: routeDetails.distance,
        totalDuration: routeDetails.duration,
        stops: optimizedStops,
        polyline: routeDetails.polyline,
      };
    } catch (error) {
      console.error('Route optimization failed:', error);
      throw error;
    }
  }

  private prepareLocations(params: OptimizationParams): Location[] {
    const locations: Location[] = [params.startLocation];
    
    params.deliveries.forEach(delivery => {
      locations.push(delivery.pickupLocation);
      locations.push(delivery.deliveryLocation);
    });
    
    return locations;
  }

  private async calculateDistanceMatrix(locations: Location[]) {
    const response = await this.mapsClient.distancematrix({
      params: {
        origins: locations,
        destinations: locations,
        key: this.configService.get('GOOGLE_MAPS_API_KEY'),
      },
    });

    return response.data.rows.map(row => 
      row.elements.map(element => ({
        distance: element.distance.value,
        duration: element.duration.value,
      }))
    );
  }

  private async optimizeStops(
    params: OptimizationParams,
    distanceMatrix: any[][]
  ): Promise<RouteStop[]> {
    // Implémentation de l'algorithme du voyageur de commerce avec contraintes
    const stops: RouteStop[] = [];
    const unvisitedDeliveries = [...params.deliveries];
    let currentLocation = params.startLocation;
    let currentTime = new Date();

    while (unvisitedDeliveries.length > 0) {
      // Trouver le prochain meilleur arrêt
      let bestStop = null;
      let bestScore = Infinity;
      let bestDeliveryIndex = -1;

      for (let i = 0; i < unvisitedDeliveries.length; i++) {
        const delivery = unvisitedDeliveries[i];
        
        // Calculer le score pour le pickup
        const pickupScore = this.calculateStopScore({
          location: delivery.pickupLocation,
          currentLocation,
          currentTime,
          timeWindow: delivery.timeWindow,
          priority: delivery.priority,
        });

        if (pickupScore < bestScore) {
          bestScore = pickupScore;
          bestDeliveryIndex = i;
          bestStop = {
            deliveryId: delivery.id,
            type: 'pickup' as const,
            location: delivery.pickupLocation,
            estimatedArrival: new Date(currentTime.getTime() + pickupScore * 1000),
            estimatedDeparture: new Date(currentTime.getTime() + (pickupScore + 300) * 1000), // +5min pour le pickup
          };
        }
      }

      if (bestStop) {
        stops.push(bestStop);
        currentLocation = bestStop.location;
        currentTime = bestStop.estimatedDeparture;

        // Ajouter immédiatement la livraison correspondante
        const delivery = unvisitedDeliveries[bestDeliveryIndex];
        const deliveryStop = {
          deliveryId: delivery.id,
          type: 'delivery' as const,
          location: delivery.deliveryLocation,
          estimatedArrival: new Date(currentTime.getTime() + 1800000), // +30min estimation
          estimatedDeparture: new Date(currentTime.getTime() + 2100000), // +35min avec le temps de livraison
        };
        stops.push(deliveryStop);
        currentLocation = deliveryStop.location;
        currentTime = deliveryStop.estimatedDeparture;

        // Retirer la livraison traitée
        unvisitedDeliveries.splice(bestDeliveryIndex, 1);
      }
    }

    return stops;
  }

  private calculateStopScore(params: {
    location: Location;
    currentLocation: Location;
    currentTime: Date;
    timeWindow?: { start: Date; end: Date };
    priority?: number;
  }): number {
    let score = 0;

    // Distance score
    const distance = this.calculateDistance(params.currentLocation, params.location);
    score += distance;

    // Time window penalty
    if (params.timeWindow) {
      const arrivalTime = new Date(params.currentTime.getTime() + (distance * 1000));
      if (arrivalTime > params.timeWindow.end) {
        score += 10000; // Grande pénalité pour les retards
      } else if (arrivalTime < params.timeWindow.start) {
        score += (params.timeWindow.start.getTime() - arrivalTime.getTime()) / 1000;
      }
    }

    // Priority bonus
    if (params.priority) {
      score -= params.priority * 1000; // Réduction du score pour les livraisons prioritaires
    }

    return score;
  }

  private calculateDistance(point1: Location, point2: Location): number {
    const R = 6371e3; // Rayon de la terre en mètres
    const φ1 = this.toRadians(point1.latitude);
    const φ2 = this.toRadians(point2.latitude);
    const Δφ = this.toRadians(point2.latitude - point1.latitude);
    const Δλ = this.toRadians(point2.longitude - point1.longitude);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  private async calculateDetailedRoute(stops: RouteStop[]) {
    const waypoints = stops.map(stop => stop.location);
    
    const response = await this.mapsClient.directions({
      params: {
        origin: waypoints[0],
        destination: waypoints[waypoints.length - 1],
        waypoints: waypoints.slice(1, -1),
        optimize: true,
        key: this.configService.get('GOOGLE_MAPS_API_KEY'),
      },
    });

    const route = response.data.routes[0];
    
    return {
      distance: route.legs.reduce((total, leg) => total + leg.distance.value, 0),
      duration: route.legs.reduce((total, leg) => total + leg.duration.value, 0),
      polyline: route.overview_polyline.points,
    };
  }

  async reoptimizeRoutes() {
    try {
      // Récupérer tous les chauffeurs actifs
      const activeDrivers = await this.driverService.getActiveDrivers();

      for (const driver of activeDrivers) {
        // Récupérer les livraisons en cours du chauffeur
        const pendingDeliveries = await this.deliveryService.getDriverPendingDeliveries(driver.id);

        if (pendingDeliveries.length > 0) {
          // Optimiser la route
          const optimizedRoute = await this.optimizeRoute({
            driverId: driver.id,
            startLocation: driver.currentLocation,
            deliveries: pendingDeliveries,
          });

          // Mettre à jour l'ordre des livraisons
          await this.deliveryService.updateDeliveryOrder(
            driver.id,
            optimizedRoute.stops.map(stop => stop.deliveryId)
          );
        }
      }
    } catch (error) {
      console.error('Failed to reoptimize routes:', error);
      throw error;
    }
  }
}
