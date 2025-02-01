import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident, IncidentStatus, IncidentType } from '../entities/incident.entity';
import { Delivery } from '../entities/delivery.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Driver } from '../entities/driver.entity';

@Injectable()
export class IncidentManagementService {
  constructor(
    @InjectRepository(Incident)
    private incidentRepo: Repository<Incident>,
    @InjectRepository(Delivery)
    private deliveryRepo: Repository<Delivery>,
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Driver)
    private driverRepo: Repository<Driver>,
  ) {}

  // Création et mise à jour des incidents
  async createIncident(data: Partial<Incident>): Promise<Incident> {
    const incident = this.incidentRepo.create(data);

    // Mettre à jour la timeline
    incident.timeline = {
      reportedAt: new Date(),
      events: [
        {
          timestamp: new Date(),
          action: 'CREATED',
          description: 'Incident signalé',
          user: data.driver.id,
        },
      ],
    };

    const savedIncident = await this.incidentRepo.save(incident);

    // Mettre à jour les entités associées si nécessaire
    if (incident.delivery) {
      await this.updateDeliveryForIncident(incident);
    }

    if (incident.vehicle) {
      await this.updateVehicleForIncident(incident);
    }

    return savedIncident;
  }

  async updateIncidentStatus(
    id: string,
    status: IncidentStatus,
    details?: any,
  ): Promise<Incident> {
    const incident = await this.incidentRepo.findOne({
      where: { id },
      relations: ['driver', 'delivery', 'vehicle'],
    });

    incident.status = status;
    incident.timeline.events.push({
      timestamp: new Date(),
      action: `STATUS_${status}`,
      description: details?.description || `Statut mis à jour: ${status}`,
      user: details?.userId,
    });

    if (status === IncidentStatus.RESOLVED) {
      incident.timeline.resolvedAt = new Date();
      if (incident.resolution) {
        incident.resolution = {
          ...incident.resolution,
          ...details,
        };
      }
    }

    return this.incidentRepo.save(incident);
  }

  // Gestion des impacts
  private async updateDeliveryForIncident(incident: Incident): Promise<void> {
    const delivery = await this.deliveryRepo.findOne({
      where: { id: incident.delivery.id },
    });

    if (incident.type === IncidentType.DELAY) {
      delivery.timing.delays = delivery.timing.delays || [];
      delivery.timing.delays.push({
        reason: incident.title,
        duration: incident.impact?.deliveryDelay || 0,
      });
    }

    await this.deliveryRepo.save(delivery);
  }

  private async updateVehicleForIncident(incident: Incident): Promise<void> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: incident.vehicle.id },
    });

    if (incident.type === IncidentType.VEHICLE_BREAKDOWN) {
      vehicle.status = 'REPAIR';
      vehicle.performance.incidentCount += 1;
    }

    await this.vehicleRepo.save(vehicle);
  }

  // Suivi et analyse
  async getIncidentStatistics(
    filters: {
      startDate?: Date;
      endDate?: Date;
      type?: IncidentType;
      driverId?: string;
    } = {},
  ): Promise<any> {
    const query = this.incidentRepo
      .createQueryBuilder('incident')
      .leftJoinAndSelect('incident.driver', 'driver')
      .leftJoinAndSelect('incident.delivery', 'delivery')
      .leftJoinAndSelect('incident.vehicle', 'vehicle');

    if (filters.startDate) {
      query.where('incident.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('incident.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.type) {
      query.andWhere('incident.type = :type', { type: filters.type });
    }

    if (filters.driverId) {
      query.andWhere('driver.id = :driverId', { driverId: filters.driverId });
    }

    const incidents = await query.getMany();

    return {
      total: incidents.length,
      byType: this.groupIncidentsByType(incidents),
      bySeverity: this.groupIncidentsBySeverity(incidents),
      averageResolutionTime: this.calculateAverageResolutionTime(incidents),
      totalImpact: this.calculateTotalImpact(incidents),
    };
  }

  private groupIncidentsByType(incidents: Incident[]): Record<string, number> {
    return incidents.reduce((acc, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {});
  }

  private groupIncidentsBySeverity(
    incidents: Incident[],
  ): Record<string, number> {
    return incidents.reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateAverageResolutionTime(incidents: Incident[]): number {
    const resolvedIncidents = incidents.filter(
      i => i.timeline.resolvedAt && i.timeline.reportedAt,
    );

    if (resolvedIncidents.length === 0) return 0;

    const totalTime = resolvedIncidents.reduce((sum, incident) => {
      return (
        sum +
        (incident.timeline.resolvedAt.getTime() -
          incident.timeline.reportedAt.getTime())
      );
    }, 0);

    return totalTime / resolvedIncidents.length / (1000 * 60 * 60); // en heures
  }

  private calculateTotalImpact(incidents: Incident[]): any {
    return incidents.reduce(
      (acc, incident) => ({
        financialLoss: acc.financialLoss + (incident.impact?.financialLoss || 0),
        deliveryDelays:
          acc.deliveryDelays + (incident.impact?.deliveryDelay || 0),
        affectedDeliveries: acc.affectedDeliveries + (incident.delivery ? 1 : 0),
        affectedVehicles: acc.affectedVehicles + (incident.vehicle ? 1 : 0),
      }),
      {
        financialLoss: 0,
        deliveryDelays: 0,
        affectedDeliveries: 0,
        affectedVehicles: 0,
      },
    );
  }

  // Notifications et alertes
  async notifyIncident(incidentId: string): Promise<void> {
    const incident = await this.incidentRepo.findOne({
      where: { id: incidentId },
      relations: ['driver', 'delivery', 'vehicle'],
    });

    // Ici, vous pouvez implémenter la logique de notification
    // Par exemple, envoyer des emails, des SMS, ou des notifications push

    if (incident.notifyList) {
      for (const userId of incident.notifyList) {
        // Envoyer la notification
      }
    }
  }

  // Rapports et documentation
  async generateIncidentReport(incidentId: string): Promise<any> {
    const incident = await this.incidentRepo.findOne({
      where: { id: incidentId },
      relations: ['driver', 'delivery', 'vehicle'],
    });

    return {
      incident,
      timeline: incident.timeline,
      impact: incident.impact,
      resolution: incident.resolution,
      evidence: incident.evidence,
    };
  }
}
