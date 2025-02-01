import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { Order } from '../../orders/entities/order.entity';
import axios from 'axios';

interface Location {
  latitude: number;
  longitude: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
}

interface RouteInfo {
  distance: number;      // en mètres
  duration: number;      // en secondes
  polyline: string;     // encodé
  steps: any[];         // instructions détaillées
}

@Injectable()
export class VehicleLocationService {
  private readonly GOOGLE_MAPS_API_KEY: string;

  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {
    this.GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  }

  async updateVehicleLocation(
    vehicleId: string,
    location: Location,
  ): Promise<void> {
    await this.vehicleRepository.update(vehicleId, {
      currentLocation: location,
      lastLocationUpdate: new Date(),
    });
  }

  async findNearestVehicles(
    orderLocation: { latitude: number; longitude: number },
    maxDistance: number = 20000, // 20km par défaut
  ): Promise<{ vehicle: Vehicle; distance: number; estimatedTime: number }[]> {
    const vehicles = await this.vehicleRepository.find({
      where: { isAvailable: true },
      relations: ['driver'],
    });

    const vehiclesWithDistance = await Promise.all(
      vehicles.map(async (vehicle) => {
        const route = await this.calculateRoute(
          vehicle.currentLocation,
          orderLocation,
        );

        return {
          vehicle,
          distance: route.distance,
          estimatedTime: route.duration,
          isInternal: vehicle.isInternal,
        };
      }),
    );

    // Trier les véhicules par priorité (internes d'abord) et distance
    return vehiclesWithDistance
      .filter((v) => v.distance <= maxDistance)
      .sort((a, b) => {
        // Priorité aux véhicules internes
        if (a.isInternal !== b.isInternal) {
          return a.isInternal ? -1 : 1;
        }
        // Ensuite par distance
        return a.distance - b.distance;
      });
  }

  async calculateDeliveryRoute(
    vehicleId: string,
    order: Order,
  ): Promise<{
    pickupRoute: RouteInfo;
    deliveryRoute: RouteInfo;
    totalDistance: number;
    totalDuration: number;
  }> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
    });

    // Calcul de l'itinéraire de ramassage
    const pickupRoute = await this.calculateRoute(
      vehicle.currentLocation,
      order.pickupLocation,
    );

    // Calcul de l'itinéraire de livraison
    const deliveryRoute = await this.calculateRoute(
      order.pickupLocation,
      order.deliveryLocation,
    );

    return {
      pickupRoute,
      deliveryRoute,
      totalDistance: pickupRoute.distance + deliveryRoute.distance,
      totalDuration: pickupRoute.duration + deliveryRoute.duration +
        this.estimateLoadingTime(order) + this.estimateUnloadingTime(order),
    };
  }

  private async calculateRoute(
    origin: Location,
    destination: { latitude: number; longitude: number },
  ): Promise<RouteInfo> {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/directions/json',
        {
          params: {
            origin: `${origin.latitude},${origin.longitude}`,
            destination: `${destination.latitude},${destination.longitude}`,
            key: this.GOOGLE_MAPS_API_KEY,
            mode: 'driving',
            traffic_model: 'best_guess',
            departure_time: 'now',
          },
        },
      );

      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance.value,
        duration: leg.duration_in_traffic?.value || leg.duration.value,
        polyline: route.overview_polyline.points,
        steps: leg.steps,
      };
    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error);
      throw new Error('Impossible de calculer l\'itinéraire');
    }
  }

  private estimateLoadingTime(order: Order): number {
    // Estimation basée sur le volume et le poids de la commande
    const baseTime = 600; // 10 minutes de base
    const volumeTime = order.volume * 30; // 30 secondes par m3
    const weightTime = order.weight * 10; // 10 secondes par kg
    return baseTime + volumeTime + weightTime;
  }

  private estimateUnloadingTime(order: Order): number {
    // Similaire au chargement mais avec des facteurs différents
    const baseTime = 600;
    const volumeTime = order.volume * 40;
    const weightTime = order.weight * 15;
    return baseTime + volumeTime + weightTime;
  }

  async getVehicleStatus(vehicleId: string): Promise<{
    location: Location;
    currentOrder?: Order;
    estimatedArrival?: Date;
    route?: RouteInfo;
  }> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
      relations: ['currentOrder'],
    });

    if (!vehicle.currentOrder) {
      return { location: vehicle.currentLocation };
    }

    const route = await this.calculateDeliveryRoute(
      vehicleId,
      vehicle.currentOrder,
    );

    const estimatedArrival = new Date(
      Date.now() + route.totalDuration * 1000,
    );

    return {
      location: vehicle.currentLocation,
      currentOrder: vehicle.currentOrder,
      estimatedArrival,
      route: route.deliveryRoute,
    };
  }
}
