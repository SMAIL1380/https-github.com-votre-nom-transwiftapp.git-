import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { VehicleLocationService } from '../../vehicles/services/vehicle-location.service';
import { NotificationsService } from '../../notifications/notifications.service';

interface AssignmentCriteria {
  maxDistance?: number;        // Distance maximale en mètres
  maxWaitingTime?: number;     // Temps d'attente maximum en minutes
  priorityScore?: number;      // Score de priorité minimum
  vehicleTypes?: string[];     // Types de véhicules requis
}

@Injectable()
export class OrderAssignmentService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    private vehicleLocationService: VehicleLocationService,
    private notificationsService: NotificationsService,
  ) {}

  async assignOrderToVehicle(
    orderId: string,
    criteria: AssignmentCriteria = {},
  ): Promise<{
    success: boolean;
    assignedVehicle?: Vehicle;
    estimatedPickup?: Date;
    estimatedDelivery?: Date;
  }> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Commande non trouvée');
    }

    // Trouver les véhicules les plus proches
    const nearestVehicles = await this.vehicleLocationService.findNearestVehicles(
      order.pickupLocation,
      criteria.maxDistance || 20000,
    );

    // Filtrer les véhicules selon les critères
    const eligibleVehicles = nearestVehicles.filter((v) => {
      // Vérifier le type de véhicule
      if (criteria.vehicleTypes && !criteria.vehicleTypes.includes(v.vehicle.type.name)) {
        return false;
      }

      // Vérifier la capacité
      if (!this.checkVehicleCapacity(v.vehicle, order)) {
        return false;
      }

      // Vérifier le temps d'attente
      if (criteria.maxWaitingTime && v.estimatedTime > criteria.maxWaitingTime * 60) {
        return false;
      }

      return true;
    });

    if (eligibleVehicles.length === 0) {
      return { success: false };
    }

    // Calculer les scores pour chaque véhicule
    const vehicleScores = await Promise.all(
      eligibleVehicles.map(async (v) => {
        const score = await this.calculateVehicleScore(v.vehicle, order, {
          distance: v.distance,
          estimatedTime: v.estimatedTime,
        });
        return { ...v, score };
      }),
    );

    // Trier par score et sélectionner le meilleur véhicule
    const bestVehicle = vehicleScores.sort((a, b) => b.score - a.score)[0];

    // Calculer l'itinéraire complet
    const route = await this.vehicleLocationService.calculateDeliveryRoute(
      bestVehicle.vehicle.id,
      order,
    );

    // Mettre à jour la commande et le véhicule
    const now = new Date();
    const estimatedPickup = new Date(
      now.getTime() + route.pickupRoute.duration * 1000,
    );
    const estimatedDelivery = new Date(
      estimatedPickup.getTime() + route.deliveryRoute.duration * 1000,
    );

    await this.orderRepository.update(orderId, {
      assignedVehicle: bestVehicle.vehicle,
      status: 'ASSIGNED',
      estimatedPickupTime: estimatedPickup,
      estimatedDeliveryTime: estimatedDelivery,
    });

    await this.vehicleRepository.update(bestVehicle.vehicle.id, {
      isAvailable: false,
      currentOrder: order,
    });

    // Envoyer les notifications
    await this.notifyAssignment(order, bestVehicle.vehicle, {
      estimatedPickup,
      estimatedDelivery,
      route,
    });

    return {
      success: true,
      assignedVehicle: bestVehicle.vehicle,
      estimatedPickup,
      estimatedDelivery,
    };
  }

  private async calculateVehicleScore(
    vehicle: Vehicle,
    order: Order,
    metrics: { distance: number; estimatedTime: number },
  ): Promise<number> {
    let score = 0;

    // Bonus pour les véhicules internes (40% du score total)
    if (vehicle.isInternal) {
      score += 40;
    }

    // Score basé sur la distance (30% du score total)
    const distanceScore = Math.max(
      0,
      30 * (1 - metrics.distance / 20000), // 20km comme distance max
    );
    score += distanceScore;

    // Score basé sur le temps estimé (20% du score total)
    const timeScore = Math.max(
      0,
      20 * (1 - metrics.estimatedTime / 3600), // 1 heure comme temps max
    );
    score += timeScore;

    // Score basé sur l'historique du véhicule (10% du score total)
    const historyScore = await this.calculateHistoryScore(vehicle);
    score += historyScore * 10;

    return score;
  }

  private async calculateHistoryScore(vehicle: Vehicle): Promise<number> {
    // Implémenter le calcul du score basé sur l'historique
    // (performances passées, fiabilité, satisfaction client, etc.)
    return 0.8; // Exemple : 80% de score historique
  }

  private checkVehicleCapacity(vehicle: Vehicle, order: Order): boolean {
    return (
      vehicle.type.maxWeight >= order.weight &&
      vehicle.type.maxVolume >= order.volume
    );
  }

  private async notifyAssignment(
    order: Order,
    vehicle: Vehicle,
    details: {
      estimatedPickup: Date;
      estimatedDelivery: Date;
      route: any;
    },
  ): Promise<void> {
    // Notification au chauffeur
    await this.notificationsService.create(
      'NEW_ORDER',
      'Nouvelle commande assignée',
      `Commande #${order.id} assignée. Ramassage prévu à ${details.estimatedPickup.toLocaleTimeString()}`,
      [vehicle.driver.id],
      {
        orderId: order.id,
        route: details.route,
      },
    );

    // Notification au client
    await this.notificationsService.create(
      'ORDER_ASSIGNED',
      'Véhicule assigné à votre commande',
      `Votre commande #${order.id} a été assignée. Livraison prévue à ${details.estimatedDelivery.toLocaleTimeString()}`,
      [order.clientId],
      {
        orderId: order.id,
        vehicleId: vehicle.id,
        estimatedDelivery: details.estimatedDelivery,
      },
    );
  }
}
