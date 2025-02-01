import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { DriverPenalty } from '../../drivers/entities/driver-penalty.entity';
import { VehicleLocationService } from '../../vehicles/services/vehicle-location.service';
import { NotificationsService } from '../../notifications/notifications.service';

interface CancellationRequest {
  orderId: string;
  driverId: string;
  reason: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

@Injectable()
export class OrderCancellationService {
  private readonly PENALTY_AMOUNT = 25; // euros
  private readonly PENALTY_DURATION = 2; // heures

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(DriverPenalty)
    private penaltyRepository: Repository<DriverPenalty>,
    private locationService: VehicleLocationService,
    private notificationsService: NotificationsService,
  ) {}

  async handleDriverCancellation(request: CancellationRequest): Promise<void> {
    // 1. Récupérer les informations nécessaires
    const order = await this.orderRepository.findOne({
      where: { id: request.orderId },
      relations: ['assignedVehicle', 'assignedVehicle.driver'],
    });

    if (!order) {
      throw new Error('Commande non trouvée');
    }

    // 2. Vérifier si le chauffeur peut annuler
    await this.validateCancellation(order, request.driverId);

    // 3. Appliquer la pénalité au chauffeur
    await this.applyDriverPenalty(request.driverId, order);

    // 4. Trouver un nouveau chauffeur
    const newAssignment = await this.findNewDriver(order, request.location);

    if (!newAssignment) {
      // Si aucun chauffeur n'est disponible, créer un incident
      await this.handleNoDriverAvailable(order);
      return;
    }

    // 5. Réaffecter la commande
    await this.reassignOrder(order, newAssignment);

    // 6. Envoyer les notifications
    await this.sendNotifications(order, request.driverId, newAssignment.driver.id);
  }

  private async validateCancellation(
    order: Order,
    driverId: string,
  ): Promise<void> {
    // Vérifier que le chauffeur est bien assigné à cette commande
    if (order.assignedVehicle.driver.id !== driverId) {
      throw new Error('Chauffeur non autorisé à annuler cette commande');
    }

    // Vérifier que la commande n'a pas déjà commencé
    if (order.status === 'IN_PROGRESS') {
      throw new Error('Impossible d\'annuler une commande en cours');
    }
  }

  private async applyDriverPenalty(
    driverId: string,
    order: Order,
  ): Promise<void> {
    // Créer la pénalité
    const penalty = this.penaltyRepository.create({
      driver: { id: driverId },
      amount: this.PENALTY_AMOUNT,
      reason: 'Annulation de commande',
      duration: this.PENALTY_DURATION,
      orderId: order.id,
      startTime: new Date(),
      endTime: new Date(Date.now() + this.PENALTY_DURATION * 60 * 60 * 1000),
    });

    await this.penaltyRepository.save(penalty);

    // Mettre à jour le solde du chauffeur
    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
    });
    driver.balance -= this.PENALTY_AMOUNT;
    await this.driverRepository.save(driver);
  }

  private async findNewDriver(
    order: Order,
    currentLocation: { latitude: number; longitude: number },
  ): Promise<{
    vehicle: Vehicle;
    driver: Driver;
    estimatedArrival: Date;
  } | null> {
    // Trouver les véhicules disponibles les plus proches
    const nearbyVehicles = await this.locationService.findNearestVehicles(
      currentLocation,
      10000, // 10km de rayon
    );

    // Filtrer les véhicules appropriés
    const eligibleVehicles = nearbyVehicles.filter((v) => {
      // Vérifier la disponibilité
      if (!v.vehicle.isAvailable) return false;

      // Vérifier la capacité
      if (
        v.vehicle.type.maxWeight < order.weight ||
        v.vehicle.type.maxVolume < order.volume
      ) {
        return false;
      }

      // Vérifier que le chauffeur n'a pas de pénalités actives
      const hasActivePenalty = v.vehicle.driver.penalties?.some(
        (p) => p.endTime > new Date(),
      );
      if (hasActivePenalty) return false;

      return true;
    });

    if (eligibleVehicles.length === 0) {
      return null;
    }

    // Sélectionner le meilleur véhicule
    const bestVehicle = eligibleVehicles[0];
    const route = await this.locationService.calculateDeliveryRoute(
      bestVehicle.vehicle.id,
      order,
    );

    return {
      vehicle: bestVehicle.vehicle,
      driver: bestVehicle.vehicle.driver,
      estimatedArrival: new Date(
        Date.now() + route.pickupRoute.duration * 1000,
      ),
    };
  }

  private async reassignOrder(
    order: Order,
    newAssignment: {
      vehicle: Vehicle;
      driver: Driver;
      estimatedArrival: Date;
    },
  ): Promise<void> {
    // Libérer l'ancien véhicule
    const oldVehicle = order.assignedVehicle;
    oldVehicle.isAvailable = true;
    oldVehicle.currentOrder = null;
    await this.vehicleRepository.save(oldVehicle);

    // Assigner le nouveau véhicule
    const newVehicle = newAssignment.vehicle;
    newVehicle.isAvailable = false;
    newVehicle.currentOrder = order;
    await this.vehicleRepository.save(newVehicle);

    // Mettre à jour la commande
    order.assignedVehicle = newVehicle;
    order.estimatedPickupTime = newAssignment.estimatedArrival;
    order.status = 'REASSIGNED';
    await this.orderRepository.save(order);
  }

  private async handleNoDriverAvailable(order: Order): Promise<void> {
    // Créer un incident
    // TODO: Implémenter la création d'incident

    // Notifier le support client
    await this.notificationsService.create(
      'NO_DRIVER_AVAILABLE',
      'Aucun chauffeur disponible',
      `Impossible de réaffecter la commande ${order.id}`,
      ['support_team'],
      {
        orderId: order.id,
        priority: 'HIGH',
      },
    );

    // Notifier le client
    await this.notificationsService.create(
      'DELIVERY_DELAYED',
      'Retard de livraison',
      'Nous rencontrons des difficultés pour affecter un nouveau chauffeur. Notre équipe fait son maximum pour résoudre la situation.',
      [order.clientId],
      {
        orderId: order.id,
      },
    );
  }

  private async sendNotifications(
    order: Order,
    oldDriverId: string,
    newDriverId: string,
  ): Promise<void> {
    // Notifier l'ancien chauffeur
    await this.notificationsService.create(
      'PENALTY_APPLIED',
      'Pénalité appliquée',
      `Une pénalité de ${this.PENALTY_AMOUNT}€ a été appliquée pour l'annulation de la commande ${order.id}`,
      [oldDriverId],
      {
        orderId: order.id,
        penaltyAmount: this.PENALTY_AMOUNT,
        penaltyDuration: this.PENALTY_DURATION,
      },
    );

    // Notifier le nouveau chauffeur
    await this.notificationsService.create(
      'NEW_ORDER_ASSIGNED',
      'Nouvelle commande assignée',
      `La commande ${order.id} vous a été assignée suite à une annulation`,
      [newDriverId],
      {
        orderId: order.id,
        priority: 'HIGH',
      },
    );

    // Notifier le client
    await this.notificationsService.create(
      'DRIVER_CHANGED',
      'Changement de chauffeur',
      'Un nouveau chauffeur a été assigné à votre commande. La livraison se poursuit normalement.',
      [order.clientId],
      {
        orderId: order.id,
        newEta: order.estimatedPickupTime,
      },
    );
  }
}
