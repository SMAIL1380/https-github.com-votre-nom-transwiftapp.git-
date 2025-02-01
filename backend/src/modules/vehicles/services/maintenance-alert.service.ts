import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { MaintenanceSchedule, MaintenancePriority } from '../entities/maintenance-schedule.entity';
import { MaintenanceReport, MaintenanceStatus } from '../entities/maintenance-report.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class MaintenanceAlertService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(MaintenanceSchedule)
    private scheduleRepository: Repository<MaintenanceSchedule>,
    @InjectRepository(MaintenanceReport)
    private reportRepository: Repository<MaintenanceReport>,
    private notificationsService: NotificationsService,
    private mailService: MailService,
  ) {}

  async checkMaintenanceAlerts(): Promise<void> {
    await Promise.all([
      this.checkUpcomingMaintenance(),
      this.checkOverdueMaintenance(),
      this.checkKilometerThresholds(),
      this.checkAnomalies(),
    ]);
  }

  private async checkUpcomingMaintenance(): Promise<void> {
    const vehicles = await this.vehicleRepository.find({
      relations: ['type'],
    });

    for (const vehicle of vehicles) {
      const schedules = await this.scheduleRepository.find({
        where: { vehicleType: { id: vehicle.type.id } },
      });

      for (const schedule of schedules) {
        const lastMaintenance = await this.reportRepository.findOne({
          where: {
            vehicle: { id: vehicle.id },
            schedule: { id: schedule.id },
            status: MaintenanceStatus.COMPLETED,
          },
          order: { completedDate: 'DESC' },
        });

        const nextMaintenanceDate = lastMaintenance
          ? new Date(lastMaintenance.completedDate.getTime() + schedule.frequencyDays * 24 * 60 * 60 * 1000)
          : new Date(vehicle.lastMaintenanceDate.getTime() + schedule.frequencyDays * 24 * 60 * 60 * 1000);

        const daysUntilMaintenance = Math.ceil(
          (nextMaintenanceDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysUntilMaintenance <= schedule.alertSettings.daysBeforeAlert) {
          await this.sendMaintenanceAlert(vehicle, schedule, {
            type: 'UPCOMING',
            daysUntil: daysUntilMaintenance,
            priority: schedule.priority,
          });
        }
      }
    }
  }

  private async checkOverdueMaintenance(): Promise<void> {
    const overdueReports = await this.reportRepository.find({
      where: {
        status: MaintenanceStatus.PENDING,
        scheduledDate: LessThan(new Date()),
      },
      relations: ['vehicle', 'schedule'],
    });

    for (const report of overdueReports) {
      const daysOverdue = Math.ceil(
        (new Date().getTime() - report.scheduledDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysOverdue >= report.schedule.alertSettings.escalationThreshold) {
        await this.sendMaintenanceAlert(report.vehicle, report.schedule, {
          type: 'OVERDUE',
          daysOverdue,
          priority: MaintenancePriority.HIGH,
        });
      }
    }
  }

  private async checkKilometerThresholds(): Promise<void> {
    const vehicles = await this.vehicleRepository.find({
      relations: ['type'],
    });

    for (const vehicle of vehicles) {
      const schedules = await this.scheduleRepository.find({
        where: { vehicleType: { id: vehicle.type.id } },
      });

      for (const schedule of schedules) {
        const lastMaintenance = await this.reportRepository.findOne({
          where: {
            vehicle: { id: vehicle.id },
            schedule: { id: schedule.id },
            status: MaintenanceStatus.COMPLETED,
          },
          order: { completedDate: 'DESC' },
        });

        if (lastMaintenance) {
          const kmSinceLastMaintenance = vehicle.currentKilometers - lastMaintenance.kilometersAtMaintenance;
          const kmUntilNextMaintenance = schedule.frequencyKm - kmSinceLastMaintenance;

          if (kmUntilNextMaintenance <= schedule.alertSettings.kmBeforeAlert) {
            await this.sendMaintenanceAlert(vehicle, schedule, {
              type: 'KILOMETER',
              kmRemaining: kmUntilNextMaintenance,
              priority: schedule.priority,
            });
          }
        }
      }
    }
  }

  private async checkAnomalies(): Promise<void> {
    const reportsWithAnomalies = await this.reportRepository.find({
      where: {
        requiresFollowUp: true,
        status: MaintenanceStatus.COMPLETED,
      },
      relations: ['vehicle', 'schedule'],
    });

    for (const report of reportsWithAnomalies) {
      const criticalAnomalies = report.anomalies.filter(
        anomaly => anomaly.severity === 'CRITICAL' && anomaly.requiresImmediate,
      );

      if (criticalAnomalies.length > 0) {
        await this.sendMaintenanceAlert(report.vehicle, report.schedule, {
          type: 'ANOMALY',
          anomalies: criticalAnomalies,
          priority: MaintenancePriority.CRITICAL,
        });
      }
    }
  }

  private async sendMaintenanceAlert(
    vehicle: Vehicle,
    schedule: MaintenanceSchedule,
    alertInfo: any,
  ): Promise<void> {
    // Créer une notification dans l'application
    await this.notificationsService.create(
      'MAINTENANCE_ALERT',
      `Alerte Maintenance - ${vehicle.registrationNumber}`,
      this.formatAlertMessage(vehicle, schedule, alertInfo),
      schedule.alertSettings.notifyRoles,
      {
        vehicleId: vehicle.id,
        scheduleId: schedule.id,
        alertInfo,
      },
    );

    // Envoyer un email aux responsables
    if (schedule.alertSettings.notifyRoles.includes('maintenance_manager')) {
      await this.mailService.sendMaintenanceAlert(
        vehicle,
        schedule,
        alertInfo,
      );
    }
  }

  private formatAlertMessage(
    vehicle: Vehicle,
    schedule: MaintenanceSchedule,
    alertInfo: any,
  ): string {
    const messages = {
      UPCOMING: `Maintenance prévue dans ${alertInfo.daysUntil} jours`,
      OVERDUE: `Maintenance en retard de ${alertInfo.daysOverdue} jours`,
      KILOMETER: `Maintenance requise dans ${alertInfo.kmRemaining} km`,
      ANOMALY: `Anomalies critiques détectées nécessitant une intervention`,
    };

    return `${vehicle.registrationNumber} - ${schedule.maintenanceType}: ${messages[alertInfo.type]}`;
  }
}
