import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Order } from '../../orders/entities/order.entity';
import { VehicleLocationService } from '../../vehicles/services/vehicle-location.service';
import { RouteOptimizationService } from './route-optimization.service';
import { DemandPredictionService } from './demand-prediction.service';

interface TrafficUpdate {
  location: {
    latitude: number;
    longitude: number;
  };
  congestionLevel: number; // 0-1
  averageSpeed: number;
  timestamp: Date;
}

interface WeatherUpdate {
  location: {
    latitude: number;
    longitude: number;
  };
  condition: string;
  severity: number; // 0-1
  timestamp: Date;
}

@Injectable()
export class DynamicRouteOptimizerService {
  private readonly UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly REROUTE_THRESHOLD = 0.2; // 20% d'amélioration requise pour reroutage

  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private locationService: VehicleLocationService,
    private routeOptimizationService: RouteOptimizationService,
    private demandPredictionService: DemandPredictionService,
  ) {
    this.startPeriodicOptimization();
  }

  private startPeriodicOptimization() {
    setInterval(async () => {
      await this.optimizeAllRoutes();
    }, this.UPDATE_INTERVAL);
  }

  async optimizeAllRoutes(): Promise<void> {
    const activeVehicles = await this.vehicleRepository.find({
      where: { status: 'ACTIVE' },
      relations: ['currentOrder', 'assignedOrders'],
    });

    for (const vehicle of activeVehicles) {
      await this.optimizeVehicleRoute(vehicle);
    }
  }

  async handleTrafficUpdate(update: TrafficUpdate): Promise<void> {
    // Trouver les véhicules dans la zone affectée
    const affectedVehicles = await this.findVehiclesInArea(
      update.location,
      5000, // 5km
    );

    for (const vehicle of affectedVehicles) {
      const currentRoute = await this.locationService.getVehicleStatus(vehicle.id);
      const impact = this.calculateTrafficImpact(update, currentRoute);

      if (impact > this.REROUTE_THRESHOLD) {
        await this.optimizeVehicleRoute(vehicle, {
          trafficUpdate: update,
        });
      }
    }
  }

  async handleWeatherUpdate(update: WeatherUpdate): Promise<void> {
    const affectedVehicles = await this.findVehiclesInArea(
      update.location,
      10000, // 10km
    );

    for (const vehicle of affectedVehicles) {
      const impact = this.calculateWeatherImpact(update);
      if (impact > this.REROUTE_THRESHOLD) {
        await this.optimizeVehicleRoute(vehicle, {
          weatherUpdate: update,
        });
      }
    }
  }

  private async optimizeVehicleRoute(
    vehicle: Vehicle,
    context?: {
      trafficUpdate?: TrafficUpdate;
      weatherUpdate?: WeatherUpdate;
    },
  ): Promise<void> {
    // 1. Récupérer les informations actuelles
    const currentRoute = await this.locationService.getVehicleStatus(vehicle.id);
    const remainingOrders = await this.getRemainingOrders(vehicle);

    // 2. Obtenir les prédictions de demande
    const demandPredictions = await this.demandPredictionService.predictDemand(
      vehicle.currentLocation.zoneId,
      new Date(),
      new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 heures
    );

    // 3. Calculer les coûts ajustés
    const adjustedCosts = await this.calculateAdjustedCosts(
      vehicle,
      remainingOrders,
      context,
    );

    // 4. Optimiser la route
    const optimizedRoute = await this.routeOptimizationService.optimizeRoutes(
      [vehicle.id],
      remainingOrders.map((o) => o.id),
    );

    // 5. Évaluer l'amélioration
    const improvement = this.evaluateImprovement(
      currentRoute,
      optimizedRoute[0],
      adjustedCosts,
    );

    // 6. Appliquer les changements si l'amélioration est significative
    if (improvement > this.REROUTE_THRESHOLD) {
      await this.applyRouteChanges(vehicle, optimizedRoute[0]);
    }
  }

  private async findVehiclesInArea(
    location: { latitude: number; longitude: number },
    radius: number,
  ): Promise<Vehicle[]> {
    return this.vehicleRepository
      .createQueryBuilder('vehicle')
      .where(
        'ST_DWithin(vehicle.currentLocation::geography, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, :radius)',
        {
          latitude: location.latitude,
          longitude: location.longitude,
          radius,
        },
      )
      .getMany();
  }

  private calculateTrafficImpact(
    update: TrafficUpdate,
    currentRoute: any,
  ): number {
    const baseTime = currentRoute.estimatedDuration;
    const adjustedTime = baseTime / (1 - update.congestionLevel);
    return (adjustedTime - baseTime) / baseTime;
  }

  private calculateWeatherImpact(update: WeatherUpdate): number {
    // Impact basé sur la sévérité des conditions météo
    return update.severity;
  }

  private async getRemainingOrders(vehicle: Vehicle): Promise<Order[]> {
    return this.orderRepository.find({
      where: {
        assignedVehicle: { id: vehicle.id },
        status: 'IN_PROGRESS',
      },
      order: {
        priority: 'DESC',
        estimatedDeliveryTime: 'ASC',
      },
    });
  }

  private async calculateAdjustedCosts(
    vehicle: Vehicle,
    orders: Order[],
    context?: {
      trafficUpdate?: TrafficUpdate;
      weatherUpdate?: WeatherUpdate;
    },
  ): Promise<{
    timeCosts: number[][];
    distanceCosts: number[][];
  }> {
    const n = orders.length;
    const timeCosts = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));
    const distanceCosts = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;

        const route = await this.locationService.calculateRoute(
          orders[i].deliveryLocation,
          orders[j].deliveryLocation,
        );

        let timeMultiplier = 1;
        let distanceMultiplier = 1;

        // Ajuster pour le trafic
        if (context?.trafficUpdate) {
          timeMultiplier *= 1 + context.trafficUpdate.congestionLevel;
        }

        // Ajuster pour la météo
        if (context?.weatherUpdate) {
          timeMultiplier *= 1 + context.weatherUpdate.severity * 0.5;
          distanceMultiplier *= 1 + context.weatherUpdate.severity * 0.2;
        }

        timeCosts[i][j] = route.duration * timeMultiplier;
        distanceCosts[i][j] = route.distance * distanceMultiplier;
      }
    }

    return { timeCosts, distanceCosts };
  }

  private evaluateImprovement(
    currentRoute: any,
    optimizedRoute: any,
    adjustedCosts: any,
  ): number {
    const currentCost = this.calculateRouteCost(currentRoute, adjustedCosts);
    const optimizedCost = this.calculateRouteCost(optimizedRoute, adjustedCosts);
    return (currentCost - optimizedCost) / currentCost;
  }

  private calculateRouteCost(route: any, costs: any): number {
    let totalCost = 0;
    const timeWeight = 0.7;
    const distanceWeight = 0.3;

    for (let i = 0; i < route.stops.length - 1; i++) {
      const fromIndex = route.stops[i].orderIndex;
      const toIndex = route.stops[i + 1].orderIndex;
      totalCost +=
        timeWeight * costs.timeCosts[fromIndex][toIndex] +
        distanceWeight * costs.distanceCosts[fromIndex][toIndex];
    }

    return totalCost;
  }

  private async applyRouteChanges(
    vehicle: Vehicle,
    optimizedRoute: any,
  ): Promise<void> {
    // Mettre à jour l'ordre des livraisons
    for (let i = 0; i < optimizedRoute.stops.length; i++) {
      const order = await this.orderRepository.findOne({
        where: { id: optimizedRoute.stops[i].orderId },
      });
      if (order) {
        order.deliverySequence = i;
        order.estimatedDeliveryTime = new Date(
          optimizedRoute.stops[i].estimatedArrival,
        );
        await this.orderRepository.save(order);
      }
    }

    // Mettre à jour le véhicule
    vehicle.currentRoute = optimizedRoute;
    await this.vehicleRepository.save(vehicle);
  }
}
