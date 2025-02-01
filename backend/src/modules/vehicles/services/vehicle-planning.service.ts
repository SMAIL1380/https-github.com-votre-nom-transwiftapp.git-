import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Vehicle, VehicleStatus } from '../entities/vehicle.entity';
import { Delivery } from '../../delivery/entities/delivery.entity';
import { MaintenanceRecord } from '../entities/maintenance-record.entity';

interface VehicleAvailability {
  vehicleId: string;
  availableTimeSlots: Array<{
    start: Date;
    end: Date;
  }>;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  estimatedReturnTime?: Date;
}

@Injectable()
export class VehiclePlanningService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
    @InjectRepository(MaintenanceRecord)
    private maintenanceRepository: Repository<MaintenanceRecord>,
  ) {}

  async getAvailableVehicles(
    startTime: Date,
    endTime: Date,
    requiredCapacity: number,
    location?: { latitude: number; longitude: number },
  ): Promise<Vehicle[]> {
    // Récupérer tous les véhicules actifs
    const vehicles = await this.vehicleRepository.find({
      where: {
        isActive: true,
        maxLoadWeight: MoreThan(requiredCapacity),
        status: VehicleStatus.AVAILABLE,
      },
    });

    const availableVehicles = [];

    for (const vehicle of vehicles) {
      const isAvailable = await this.checkVehicleAvailability(
        vehicle.id,
        startTime,
        endTime,
      );

      if (isAvailable) {
        if (location) {
          const distance = await this.calculateDistance(
            vehicle.currentLocation,
            location,
          );
          vehicle['distance'] = distance;
        }
        availableVehicles.push(vehicle);
      }
    }

    // Trier par distance si une localisation est fournie
    if (location) {
      availableVehicles.sort((a, b) => a['distance'] - b['distance']);
    }

    return availableVehicles;
  }

  async checkVehicleAvailability(
    vehicleId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<boolean> {
    // Vérifier les livraisons planifiées
    const conflictingDeliveries = await this.deliveryRepository.find({
      where: {
        vehicle: { id: vehicleId },
        status: Between('accepted', 'in_progress'),
        timeWindow: {
          start: LessThan(endTime),
          end: MoreThan(startTime),
        },
      },
    });

    if (conflictingDeliveries.length > 0) {
      return false;
    }

    // Vérifier les maintenances planifiées
    const conflictingMaintenance = await this.maintenanceRepository.find({
      where: {
        vehicle: { id: vehicleId },
        isResolved: false,
        date: Between(startTime, endTime),
      },
    });

    return conflictingMaintenance.length === 0;
  }

  async getVehicleSchedule(vehicleId: string, startDate: Date, endDate: Date) {
    const deliveries = await this.deliveryRepository.find({
      where: {
        vehicle: { id: vehicleId },
        timeWindow: {
          start: MoreThan(startDate),
          end: LessThan(endDate),
        },
      },
      order: {
        timeWindow: { start: 'ASC' },
      },
    });

    const maintenances = await this.maintenanceRepository.find({
      where: {
        vehicle: { id: vehicleId },
        date: Between(startDate, endDate),
      },
      order: {
        date: 'ASC',
      },
    });

    // Fusionner et trier les événements
    const schedule = [
      ...deliveries.map(d => ({
        type: 'delivery',
        start: d.timeWindow.start,
        end: d.timeWindow.end,
        details: d,
      })),
      ...maintenances.map(m => ({
        type: 'maintenance',
        start: m.date,
        end: new Date(m.date.getTime() + 2 * 60 * 60 * 1000), // Estimation 2h
        details: m,
      })),
    ].sort((a, b) => a.start.getTime() - b.start.getTime());

    return schedule;
  }

  async optimizeVehicleAssignment(deliveries: Delivery[]) {
    const vehicles = await this.vehicleRepository.find({
      where: { isActive: true },
    });

    const assignments = new Map<string, Delivery[]>();
    const unassignedDeliveries = [...deliveries];

    // Trier les véhicules par capacité
    vehicles.sort((a, b) => b.maxLoadWeight - a.maxLoadWeight);

    while (unassignedDeliveries.length > 0) {
      const delivery = unassignedDeliveries[0];
      let bestVehicle = null;
      let bestScore = Infinity;

      for (const vehicle of vehicles) {
        if (vehicle.maxLoadWeight < delivery.packageDetails.weight) {
          continue;
        }

        const score = await this.calculateAssignmentScore(
          vehicle,
          delivery,
          assignments.get(vehicle.id) || [],
        );

        if (score < bestScore) {
          bestScore = score;
          bestVehicle = vehicle;
        }
      }

      if (bestVehicle) {
        if (!assignments.has(bestVehicle.id)) {
          assignments.set(bestVehicle.id, []);
        }
        assignments.get(bestVehicle.id).push(delivery);
        unassignedDeliveries.shift();
      } else {
        // Impossible d'assigner cette livraison
        break;
      }
    }

    return {
      assignments: Object.fromEntries(assignments),
      unassignedDeliveries,
    };
  }

  private async calculateAssignmentScore(
    vehicle: Vehicle,
    delivery: Delivery,
    currentAssignments: Delivery[],
  ): Promise<number> {
    // Facteurs de score
    const DISTANCE_WEIGHT = 0.4;
    const CAPACITY_WEIGHT = 0.3;
    const WORKLOAD_WEIGHT = 0.3;

    // Score basé sur la distance
    const distanceScore = await this.calculateDistance(
      vehicle.currentLocation,
      delivery.pickupLocation,
    );

    // Score basé sur l'utilisation de la capacité
    const totalWeight =
      currentAssignments.reduce(
        (sum, d) => sum + d.packageDetails.weight,
        0,
      ) + delivery.packageDetails.weight;
    const capacityScore = totalWeight / vehicle.maxLoadWeight;

    // Score basé sur la charge de travail
    const workloadScore = currentAssignments.length / 10; // Normaliser à 10 livraisons

    return (
      distanceScore * DISTANCE_WEIGHT +
      capacityScore * CAPACITY_WEIGHT +
      workloadScore * WORKLOAD_WEIGHT
    );
  }

  private async calculateDistance(point1: any, point2: any): Promise<number> {
    // Implémentation simplifiée - à remplacer par un vrai calcul de distance
    if (!point1 || !point2) return Infinity;
    
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.latitude)) *
        Math.cos(this.deg2rad(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
