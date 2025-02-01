import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery, DeliveryStatus } from '../entities/delivery.entity';
import { Driver } from '../entities/driver.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Incident } from '../entities/incident.entity';

@Injectable()
export class DeliveryManagementService {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepo: Repository<Delivery>,
    @InjectRepository(Driver)
    private driverRepo: Repository<Driver>,
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Incident)
    private incidentRepo: Repository<Incident>,
  ) {}

  // Création et mise à jour des livraisons
  async createDelivery(data: Partial<Delivery>): Promise<Delivery> {
    const delivery = this.deliveryRepo.create(data);
    return this.deliveryRepo.save(delivery);
  }

  async updateDeliveryStatus(
    id: string,
    status: DeliveryStatus,
    details?: any,
  ): Promise<Delivery> {
    const delivery = await this.deliveryRepo.findOne({
      where: { id },
      relations: ['driver', 'vehicle'],
    });

    delivery.status = status;
    delivery.timing = {
      ...delivery.timing,
      ...(status === DeliveryStatus.IN_TRANSIT && { startedAt: new Date() }),
      ...(status === DeliveryStatus.DELIVERED && { completedAt: new Date() }),
    };

    if (details) {
      Object.assign(delivery, details);
    }

    return this.deliveryRepo.save(delivery);
  }

  // Attribution des livraisons
  async assignDelivery(
    deliveryId: string,
    driverId: string,
    vehicleId: string,
  ): Promise<Delivery> {
    const [delivery, driver, vehicle] = await Promise.all([
      this.deliveryRepo.findOne({ where: { id: deliveryId } }),
      this.driverRepo.findOne({ where: { id: driverId } }),
      this.vehicleRepo.findOne({ where: { id: vehicleId } }),
    ]);

    delivery.driver = driver;
    delivery.vehicle = vehicle;
    delivery.status = DeliveryStatus.ASSIGNED;
    delivery.timing.assignedAt = new Date();

    return this.deliveryRepo.save(delivery);
  }

  // Optimisation des routes
  async optimizeRoutes(
    driverId: string,
    date: Date,
  ): Promise<{ deliveries: Delivery[]; route: any }> {
    const deliveries = await this.deliveryRepo.find({
      where: {
        driver: { id: driverId },
        'delivery.scheduledTime': {
          $gte: date,
          $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      order: {
        'delivery.scheduledTime': 'ASC',
      },
    });

    // Ici, vous pouvez implémenter votre algorithme d'optimisation
    // Pour l'exemple, nous retournons simplement les livraisons triées par heure

    return {
      deliveries,
      route: {
        // Détails de la route optimisée
      },
    };
  }

  // Suivi des livraisons
  async trackDelivery(deliveryId: string): Promise<any> {
    const delivery = await this.deliveryRepo.findOne({
      where: { id: deliveryId },
      relations: ['driver', 'vehicle'],
    });

    // Obtenir la position actuelle du véhicule
    const currentLocation = delivery.vehicle.tracking.currentLocation;

    return {
      status: delivery.status,
      currentLocation,
      estimatedArrival: delivery.timing.estimatedArrival,
      delays: delivery.timing.delays,
    };
  }

  // Gestion des preuves de livraison
  async submitDeliveryProof(
    deliveryId: string,
    proofData: {
      signature?: string;
      photos?: string[];
      notes?: string;
    },
  ): Promise<Delivery> {
    const delivery = await this.deliveryRepo.findOne({
      where: { id: deliveryId },
    });

    delivery.proof = {
      ...proofData,
      timestamp: new Date(),
    };

    return this.deliveryRepo.save(delivery);
  }

  // Gestion des retards
  async recordDelay(
    deliveryId: string,
    delay: {
      reason: string;
      duration: number;
    },
  ): Promise<Delivery> {
    const delivery = await this.deliveryRepo.findOne({
      where: { id: deliveryId },
    });

    if (!delivery.timing.delays) {
      delivery.timing.delays = [];
    }

    delivery.timing.delays.push(delay);
    delivery.timing.estimatedArrival = new Date(
      delivery.timing.estimatedArrival.getTime() + delay.duration * 60000,
    );

    return this.deliveryRepo.save(delivery);
  }

  // Rapports et statistiques
  async getDeliveryStatistics(
    filters: {
      driverId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ): Promise<any> {
    const query = this.deliveryRepo
      .createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.driver', 'driver')
      .leftJoinAndSelect('delivery.incidents', 'incidents');

    if (filters.driverId) {
      query.where('driver.id = :driverId', { driverId: filters.driverId });
    }

    if (filters.startDate) {
      query.andWhere('delivery.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('delivery.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const deliveries = await query.getMany();

    return {
      total: deliveries.length,
      completed: deliveries.filter(d => d.status === DeliveryStatus.DELIVERED)
        .length,
      failed: deliveries.filter(d => d.status === DeliveryStatus.FAILED).length,
      onTime: deliveries.filter(d => !d.timing.delays?.length).length,
      averageRating:
        deliveries.reduce((sum, d) => sum + (d.feedback?.rating || 0), 0) /
        deliveries.length,
      incidents: deliveries.reduce(
        (sum, d) => sum + (d.incidents?.length || 0),
        0,
      ),
    };
  }

  // Gestion des feedbacks
  async submitDeliveryFeedback(
    deliveryId: string,
    feedback: {
      rating: number;
      comment?: string;
      issues?: string[];
    },
  ): Promise<Delivery> {
    const delivery = await this.deliveryRepo.findOne({
      where: { id: deliveryId },
    });

    delivery.feedback = {
      ...feedback,
      timestamp: new Date(),
    };

    return this.deliveryRepo.save(delivery);
  }
}
