import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident, IncidentType, IncidentSeverity, IncidentStatus } from '../entities/incident.entity';
import { Order } from '../../orders/entities/order.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { RouteOptimizationService } from '../../delivery/services/route-optimization.service';
import { NotificationsService } from '../../notifications/notifications.service';

interface IncidentReport {
  type: IncidentType;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  vehicleId?: string;
  orderId?: string;
  driverId?: string;
  estimatedDelay?: number;
}

@Injectable()
export class IncidentManagementService {
  constructor(
    @InjectRepository(Incident)
    private incidentRepository: Repository<Incident>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    private routeOptimizationService: RouteOptimizationService,
    private notificationsService: NotificationsService,
  ) {}

  async reportIncident(report: IncidentReport): Promise<Incident> {
    // Créer l'incident
    const incident = this.incidentRepository.create({
      type: report.type,
      description: report.description,
      location: report.location,
      severity: await this.calculateIncidentSeverity(report),
      impact: {
        estimatedDelay: report.estimatedDelay || 0,
        affectedOrders: [],
        customerNotified: false,
      },
      resolution: {
        priority: 0,
        steps: [],
      },
      timeline: {
        reported: new Date(),
      },
      customerCommunication: {
        notificationsSent: [],
      },
    });

    // Associer le véhicule et la commande si fournis
    if (report.vehicleId) {
      incident.vehicle = await this.vehicleRepository.findOne({
        where: { id: report.vehicleId },
      });
    }

    if (report.orderId) {
      incident.order = await this.orderRepository.findOne({
        where: { id: report.orderId },
      });
    }

    // Sauvegarder l'incident
    await this.incidentRepository.save(incident);

    // Déclencher le processus de gestion d'incident
    await this.handleIncident(incident);

    return incident;
  }

  private async calculateIncidentSeverity(
    report: IncidentReport,
  ): Promise<IncidentSeverity> {
    // Calculer la sévérité basée sur plusieurs facteurs
    let severityScore = 0;

    // Impact temporel
    if (report.estimatedDelay) {
      if (report.estimatedDelay > 120) severityScore += 3;
      else if (report.estimatedDelay > 60) severityScore += 2;
      else if (report.estimatedDelay > 30) severityScore += 1;
    }

    // Type d'incident
    switch (report.type) {
      case IncidentType.ACCIDENT:
        severityScore += 3;
        break;
      case IncidentType.BREAKDOWN:
        severityScore += 2;
        break;
      case IncidentType.DELAY:
        severityScore += 1;
        break;
    }

    // Nombre de commandes affectées
    const affectedOrders = await this.findAffectedOrders(report);
    if (affectedOrders.length > 10) severityScore += 3;
    else if (affectedOrders.length > 5) severityScore += 2;
    else if (affectedOrders.length > 0) severityScore += 1;

    // Déterminer la sévérité finale
    if (severityScore >= 6) return IncidentSeverity.CRITICAL;
    if (severityScore >= 4) return IncidentSeverity.HIGH;
    if (severityScore >= 2) return IncidentSeverity.MEDIUM;
    return IncidentSeverity.LOW;
  }

  private async handleIncident(incident: Incident): Promise<void> {
    // 1. Identifier les commandes affectées
    const affectedOrders = await this.findAffectedOrders({
      type: incident.type,
      location: incident.location,
      vehicleId: incident.vehicle?.id,
      orderId: incident.order?.id,
      estimatedDelay: incident.impact.estimatedDelay,
    });

    // 2. Mettre à jour l'impact
    incident.impact.affectedOrders = affectedOrders.map((order) => order.id);
    await this.incidentRepository.save(incident);

    // 3. Notifier les parties prenantes
    await this.notifyStakeholders(incident, affectedOrders);

    // 4. Initier la résolution
    await this.initiateResolution(incident, affectedOrders);
  }

  private async findAffectedOrders(report: IncidentReport): Promise<Order[]> {
    const affectedOrders: Order[] = [];

    if (report.orderId) {
      const order = await this.orderRepository.findOne({
        where: { id: report.orderId },
      });
      if (order) affectedOrders.push(order);
    }

    if (report.vehicleId) {
      const vehicleOrders = await this.orderRepository.find({
        where: {
          assignedVehicle: { id: report.vehicleId },
          status: 'IN_PROGRESS',
        },
      });
      affectedOrders.push(...vehicleOrders);
    }

    // Trouver les commandes dans la zone affectée
    const nearbyOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where(
        'ST_DWithin(order.deliveryLocation::geography, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, :radius)',
        {
          latitude: report.location.latitude,
          longitude: report.location.longitude,
          radius: 5000, // 5km
        },
      )
      .andWhere('order.status = :status', { status: 'IN_PROGRESS' })
      .getMany();

    affectedOrders.push(...nearbyOrders);

    return [...new Set(affectedOrders)];
  }

  private async notifyStakeholders(
    incident: Incident,
    affectedOrders: Order[],
  ): Promise<void> {
    // 1. Notifier l'équipe de gestion
    await this.notificationsService.create(
      'INCIDENT_REPORTED',
      `Incident ${incident.type} - ${incident.severity}`,
      incident.description,
      ['management_team'],
      { incidentId: incident.id },
    );

    // 2. Notifier les clients affectés
    for (const order of affectedOrders) {
      const delay = incident.impact.estimatedDelay;
      const message = this.generateCustomerMessage(incident, order, delay);
      
      await this.notificationsService.create(
        'DELIVERY_DELAY',
        'Retard de livraison',
        message,
        [order.clientId],
        {
          orderId: order.id,
          incidentId: incident.id,
          newEta: new Date(order.estimatedDeliveryTime.getTime() + delay * 60000),
        },
      );
    }

    // 3. Notifier les chauffeurs concernés
    if (incident.vehicle?.driver) {
      await this.notificationsService.create(
        'INCIDENT_INSTRUCTIONS',
        'Instructions suite à incident',
        this.generateDriverInstructions(incident),
        [incident.vehicle.driver.id],
        { incidentId: incident.id },
      );
    }
  }

  private async initiateResolution(
    incident: Incident,
    affectedOrders: Order[],
  ): Promise<void> {
    // 1. Créer un plan de résolution
    const resolutionSteps = this.createResolutionPlan(incident);
    incident.resolution.steps = resolutionSteps;
    incident.status = IncidentStatus.IN_PROGRESS;
    await this.incidentRepository.save(incident);

    // 2. Réoptimiser les routes si nécessaire
    if (incident.type !== IncidentType.CANCELLATION) {
      const vehiclesToReoptimize = await this.findVehiclesForReoptimization(
        incident,
        affectedOrders,
      );
      
      await this.routeOptimizationService.optimizeRoutes(
        vehiclesToReoptimize.map((v) => v.id),
        affectedOrders.map((o) => o.id),
      );
    }

    // 3. Mettre à jour les ETA
    await this.updateDeliveryTimes(incident, affectedOrders);
  }

  private createResolutionPlan(incident: Incident): any[] {
    const steps = [];

    switch (incident.type) {
      case IncidentType.BREAKDOWN:
        steps.push(
          {
            action: 'Contacter le service de dépannage',
            status: 'PENDING',
          },
          {
            action: 'Évaluer les réparations nécessaires',
            status: 'PENDING',
          },
          {
            action: 'Réaffecter les commandes si nécessaire',
            status: 'PENDING',
          },
        );
        break;

      case IncidentType.DELAY:
        steps.push(
          {
            action: 'Analyser la cause du retard',
            status: 'PENDING',
          },
          {
            action: 'Optimiser l\'itinéraire',
            status: 'PENDING',
          },
          {
            action: 'Mettre à jour les ETA',
            status: 'PENDING',
          },
        );
        break;

      case IncidentType.CANCELLATION:
        steps.push(
          {
            action: 'Annuler la commande',
            status: 'PENDING',
          },
          {
            action: 'Notifier le client',
            status: 'PENDING',
          },
          {
            action: 'Traiter le remboursement si nécessaire',
            status: 'PENDING',
          },
        );
        break;

      // Ajouter d'autres types d'incidents...
    }

    return steps;
  }

  private async findVehiclesForReoptimization(
    incident: Incident,
    affectedOrders: Order[],
  ): Promise<Vehicle[]> {
    const vehicles = new Set<Vehicle>();

    // Ajouter le véhicule de l'incident
    if (incident.vehicle) {
      vehicles.add(incident.vehicle);
    }

    // Ajouter les véhicules des commandes affectées
    for (const order of affectedOrders) {
      if (order.assignedVehicle) {
        vehicles.add(order.assignedVehicle);
      }
    }

    // Trouver des véhicules disponibles à proximité
    const nearbyVehicles = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .where(
        'ST_DWithin(vehicle.currentLocation::geography, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, :radius)',
        {
          latitude: incident.location.latitude,
          longitude: incident.location.longitude,
          radius: 10000, // 10km
        },
      )
      .andWhere('vehicle.isAvailable = :isAvailable', { isAvailable: true })
      .getMany();

    nearbyVehicles.forEach((v) => vehicles.add(v));

    return Array.from(vehicles);
  }

  private async updateDeliveryTimes(
    incident: Incident,
    affectedOrders: Order[],
  ): Promise<void> {
    for (const order of affectedOrders) {
      const delay = incident.impact.estimatedDelay;
      order.estimatedDeliveryTime = new Date(
        order.estimatedDeliveryTime.getTime() + delay * 60000,
      );
      await this.orderRepository.save(order);
    }
  }

  private generateCustomerMessage(
    incident: Incident,
    order: Order,
    delay: number,
  ): string {
    const newEta = new Date(
      order.estimatedDeliveryTime.getTime() + delay * 60000,
    );

    let message = `Nous sommes désolés, votre livraison pour la commande #${order.id} est retardée en raison `;

    switch (incident.type) {
      case IncidentType.TRAFFIC:
        message += 'de conditions de circulation difficiles.';
        break;
      case IncidentType.WEATHER:
        message += 'de conditions météorologiques défavorables.';
        break;
      case IncidentType.BREAKDOWN:
        message += 'd\'un problème technique avec notre véhicule.';
        break;
      default:
        message += 'd\'un incident imprévu.';
    }

    message += `\nNouvelle heure de livraison estimée : ${newEta.toLocaleTimeString()}`;
    return message;
  }

  private generateDriverInstructions(incident: Incident): string {
    let instructions = 'Instructions suite à l\'incident :\n';

    switch (incident.type) {
      case IncidentType.BREAKDOWN:
        instructions += `
1. Garez le véhicule en sécurité
2. Contactez le service technique au XXXXXX
3. Attendez l'arrivée du dépanneur
4. Ne quittez pas le véhicule`;
        break;

      case IncidentType.DELAY:
        instructions += `
1. Continuez votre route en toute sécurité
2. Nous optimisons votre itinéraire
3. Les clients ont été informés du retard
4. Suivez les nouvelles instructions de navigation`;
        break;

      // Ajouter d'autres types d'incidents...
    }

    return instructions;
  }
}
