import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Order } from '../../orders/entities/order.entity';
import { VehicleLocationService } from '../../vehicles/services/vehicle-location.service';

interface Stop {
  orderId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timeWindow: {
    start: Date;
    end: Date;
  };
  serviceTime: number; // en minutes
  priority: number;
}

interface Route {
  vehicleId: string;
  stops: Stop[];
  totalDistance: number;
  totalDuration: number;
  startTime: Date;
  endTime: Date;
}

@Injectable()
export class RouteOptimizationService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private locationService: VehicleLocationService,
  ) {}

  async optimizeRoutes(
    vehicleIds: string[],
    orderIds: string[],
  ): Promise<Route[]> {
    const vehicles = await this.vehicleRepository.find({
      where: { id: vehicleIds },
    });
    const orders = await this.orderRepository.find({
      where: { id: orderIds },
    });

    // Convertir les commandes en arrêts
    const stops = this.ordersToStops(orders);

    // Créer la matrice de distance
    const distanceMatrix = await this.createDistanceMatrix(stops);

    // Optimiser les routes pour chaque véhicule
    const routes = await this.solveVRP(vehicles, stops, distanceMatrix);

    // Affiner les routes avec les contraintes temporelles
    const optimizedRoutes = await this.refineRoutes(routes);

    return optimizedRoutes;
  }

  private ordersToStops(orders: Order[]): Stop[] {
    return orders.map((order) => ({
      orderId: order.id,
      location: order.deliveryLocation,
      timeWindow: {
        start: order.deliveryWindow.start,
        end: order.deliveryWindow.end,
      },
      serviceTime: this.calculateServiceTime(order),
      priority: order.priority,
    }));
  }

  private calculateServiceTime(order: Order): number {
    // Temps de base en minutes
    let baseTime = 10;

    // Ajout de temps basé sur le volume et le poids
    baseTime += Math.ceil(order.volume * 2); // 2 minutes par m3
    baseTime += Math.ceil(order.weight * 0.5); // 30 secondes par kg

    // Ajout de temps pour des conditions spéciales
    if (order.requiresSignature) baseTime += 5;
    if (order.hasFragileItems) baseTime += 5;
    if (order.needsAssembly) baseTime += 15;

    return baseTime;
  }

  private async createDistanceMatrix(
    stops: Stop[],
  ): Promise<{ distance: number; duration: number }[][]> {
    const matrix: { distance: number; duration: number }[][] = [];

    for (const origin of stops) {
      const row: { distance: number; duration: number }[] = [];
      for (const destination of stops) {
        if (origin === destination) {
          row.push({ distance: 0, duration: 0 });
          continue;
        }

        const route = await this.locationService.calculateRoute(
          origin.location,
          destination.location,
        );

        row.push({
          distance: route.distance,
          duration: route.duration,
        });
      }
      matrix.push(row);
    }

    return matrix;
  }

  private async solveVRP(
    vehicles: Vehicle[],
    stops: Stop[],
    distanceMatrix: { distance: number; duration: number }[][],
  ): Promise<Route[]> {
    // Implémenter l'algorithme de Clarke & Wright Savings
    const routes: Route[] = [];

    // Trier les véhicules par capacité
    const sortedVehicles = [...vehicles].sort(
      (a, b) => b.type.maxWeight - a.type.maxWeight,
    );

    // Créer les routes initiales
    for (const vehicle of sortedVehicles) {
      const route: Route = {
        vehicleId: vehicle.id,
        stops: [],
        totalDistance: 0,
        totalDuration: 0,
        startTime: new Date(),
        endTime: new Date(),
      };
      routes.push(route);
    }

    // Calculer les économies pour chaque paire d'arrêts
    const savings: {
      i: number;
      j: number;
      saving: number;
    }[] = [];

    for (let i = 0; i < stops.length; i++) {
      for (let j = i + 1; j < stops.length; j++) {
        const saving =
          distanceMatrix[0][i].distance +
          distanceMatrix[0][j].distance -
          distanceMatrix[i][j].distance;
        savings.push({ i, j, saving });
      }
    }

    // Trier les économies par ordre décroissant
    savings.sort((a, b) => b.saving - a.saving);

    // Construire les routes
    for (const saving of savings) {
      const { i, j } = saving;
      const stopI = stops[i];
      const stopJ = stops[j];

      // Trouver la meilleure route pour cette paire
      let bestRoute: Route | null = null;
      let bestIncrease = Infinity;

      for (const route of routes) {
        const increase = this.calculateRouteIncrease(route, stopI, stopJ);
        if (
          increase < bestIncrease &&
          this.isRouteFeasible(route, stopI, stopJ)
        ) {
          bestRoute = route;
          bestIncrease = increase;
        }
      }

      if (bestRoute) {
        this.addStopsToRoute(bestRoute, stopI, stopJ);
      }
    }

    return routes;
  }

  private async refineRoutes(routes: Route[]): Promise<Route[]> {
    const refinedRoutes = [...routes];

    for (const route of refinedRoutes) {
      // Optimiser l'ordre des arrêts
      route.stops = this.optimizeStopOrder(route.stops);

      // Calculer les heures précises
      const timings = await this.calculateRouteTimings(route);
      route.startTime = timings.startTime;
      route.endTime = timings.endTime;
      route.totalDuration = timings.totalDuration;
    }

    return refinedRoutes;
  }

  private optimizeStopOrder(stops: Stop[]): Stop[] {
    // Implémenter un algorithme 2-opt pour améliorer l'ordre
    let improved = true;
    let bestStops = [...stops];
    let bestDistance = this.calculateTotalDistance(bestStops);

    while (improved) {
      improved = false;
      for (let i = 1; i < stops.length - 2; i++) {
        for (let j = i + 1; j < stops.length - 1; j++) {
          const newStops = this.twoOptSwap(bestStops, i, j);
          const newDistance = this.calculateTotalDistance(newStops);

          if (newDistance < bestDistance) {
            bestStops = newStops;
            bestDistance = newDistance;
            improved = true;
          }
        }
      }
    }

    return bestStops;
  }

  private twoOptSwap(stops: Stop[], i: number, j: number): Stop[] {
    const newStops = [...stops];
    const reversed = newStops.slice(i, j + 1).reverse();
    newStops.splice(i, j - i + 1, ...reversed);
    return newStops;
  }

  private calculateTotalDistance(stops: Stop[]): number {
    let total = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      total += this.calculateDistance(
        stops[i].location,
        stops[i + 1].location,
      );
    }
    return total;
  }

  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number },
  ): number {
    // Formule de Haversine
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) *
        Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private calculateRouteIncrease(
    route: Route,
    stopI: Stop,
    stopJ: Stop,
  ): number {
    // Calculer l'augmentation de la distance si on ajoute ces arrêts
    const currentDistance = route.totalDistance;
    const newStops = [...route.stops, stopI, stopJ];
    const newDistance = this.calculateTotalDistance(newStops);
    return newDistance - currentDistance;
  }

  private isRouteFeasible(route: Route, ...newStops: Stop[]): boolean {
    // Vérifier les contraintes de capacité et de temps
    const allStops = [...route.stops, ...newStops];

    // Vérifier les fenêtres de temps
    const timings = this.calculateRouteTimings(route);
    if (!timings) return false;

    // Vérifier que tous les arrêts peuvent être servis dans leurs fenêtres de temps
    for (const stop of allStops) {
      if (
        timings.startTime > stop.timeWindow.end ||
        timings.endTime < stop.timeWindow.start
      ) {
        return false;
      }
    }

    return true;
  }

  private async calculateRouteTimings(
    route: Route,
  ): Promise<{
    startTime: Date;
    endTime: Date;
    totalDuration: number;
  }> {
    let currentTime = new Date();
    let totalDuration = 0;

    for (let i = 0; i < route.stops.length; i++) {
      const stop = route.stops[i];
      
      // Ajouter le temps de trajet
      if (i > 0) {
        const previousStop = route.stops[i - 1];
        const travelTime = await this.locationService.calculateRoute(
          previousStop.location,
          stop.location,
        );
        totalDuration += travelTime.duration;
        currentTime = new Date(currentTime.getTime() + travelTime.duration * 1000);
      }

      // Attendre le début de la fenêtre de temps si nécessaire
      if (currentTime < stop.timeWindow.start) {
        const waitTime = stop.timeWindow.start.getTime() - currentTime.getTime();
        totalDuration += waitTime / 1000;
        currentTime = new Date(stop.timeWindow.start);
      }

      // Ajouter le temps de service
      totalDuration += stop.serviceTime * 60;
      currentTime = new Date(currentTime.getTime() + stop.serviceTime * 60 * 1000);

      // Vérifier si on dépasse la fenêtre de temps
      if (currentTime > stop.timeWindow.end) {
        return null;
      }
    }

    return {
      startTime: route.stops[0]?.timeWindow.start || new Date(),
      endTime: currentTime,
      totalDuration,
    };
  }

  private addStopsToRoute(route: Route, ...stops: Stop[]): void {
    route.stops.push(...stops);
    route.totalDistance = this.calculateTotalDistance(route.stops);
    const timings = this.calculateRouteTimings(route);
    if (timings) {
      route.startTime = timings.startTime;
      route.endTime = timings.endTime;
      route.totalDuration = timings.totalDuration;
    }
  }
}
