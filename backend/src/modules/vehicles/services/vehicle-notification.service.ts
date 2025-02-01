import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Vehicle } from '../entities/vehicle.entity';
import { MaintenanceRecord } from '../entities/maintenance-record.entity';
import { NotificationService } from '../../notifications/services/notification.service';
import { addDays, differenceInDays } from 'date-fns';

@Injectable()
export class VehicleNotificationService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(MaintenanceRecord)
    private maintenanceRepository: Repository<MaintenanceRecord>,
    private notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkMaintenanceSchedule() {
    const vehicles = await this.vehicleRepository.find({
      relations: ['currentDriver'],
    });

    for (const vehicle of vehicles) {
      await this.checkVehicleMaintenance(vehicle);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkFuelLevels() {
    const vehicles = await this.vehicleRepository.find({
      where: {
        status: 'in_use',
        currentFuelLevel: LessThanOrEqual(0.2), // 20% du niveau de carburant
      },
      relations: ['currentDriver'],
    });

    for (const vehicle of vehicles) {
      await this.notifyLowFuel(vehicle);
    }
  }

  private async checkVehicleMaintenance(vehicle: Vehicle) {
    // Vérifier la maintenance programmée
    if (vehicle.nextMaintenanceDate) {
      const daysUntilMaintenance = differenceInDays(
        new Date(vehicle.nextMaintenanceDate),
        new Date(),
      );

      if (daysUntilMaintenance <= 7) {
        await this.notifyUpcomingMaintenance(vehicle, daysUntilMaintenance);
      }
    }

    // Vérifier le kilométrage
    const lastMaintenance = await this.maintenanceRepository.findOne({
      where: { vehicle: { id: vehicle.id } },
      order: { date: 'DESC' },
    });

    if (lastMaintenance) {
      const kmSinceLastMaintenance = vehicle.mileage - lastMaintenance.mileageAtService;
      if (kmSinceLastMaintenance >= 9500) { // Alerte à 9500km (maintenance à 10000km)
        await this.notifyMileageMaintenance(vehicle, kmSinceLastMaintenance);
      }
    }
  }

  private async notifyUpcomingMaintenance(vehicle: Vehicle, daysRemaining: number) {
    const recipients = await this.getNotificationRecipients(vehicle);
    
    const message = {
      title: 'Maintenance programmée',
      body: `Le véhicule ${vehicle.registrationNumber} doit passer en maintenance dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}.`,
      data: {
        type: 'maintenance_reminder',
        vehicleId: vehicle.id,
        daysRemaining,
        maintenanceDate: vehicle.nextMaintenanceDate,
      },
    };

    await this.notificationService.sendNotification(recipients, message);
  }

  private async notifyMileageMaintenance(vehicle: Vehicle, kmSinceLastMaintenance: number) {
    const recipients = await this.getNotificationRecipients(vehicle);
    
    const message = {
      title: 'Maintenance kilométrique requise',
      body: `Le véhicule ${vehicle.registrationNumber} a parcouru ${Math.round(kmSinceLastMaintenance)}km depuis sa dernière maintenance.`,
      data: {
        type: 'mileage_maintenance',
        vehicleId: vehicle.id,
        kmSinceLastMaintenance,
      },
    };

    await this.notificationService.sendNotification(recipients, message);
  }

  private async notifyLowFuel(vehicle: Vehicle) {
    const recipients = await this.getNotificationRecipients(vehicle);
    
    const fuelPercentage = (vehicle.currentFuelLevel / vehicle.fuelCapacity) * 100;
    
    const message = {
      title: 'Niveau de carburant bas',
      body: `Le véhicule ${vehicle.registrationNumber} n'a plus que ${Math.round(fuelPercentage)}% de carburant.`,
      data: {
        type: 'low_fuel',
        vehicleId: vehicle.id,
        fuelLevel: vehicle.currentFuelLevel,
        fuelPercentage,
      },
    };

    await this.notificationService.sendNotification(recipients, message);
  }

  private async getNotificationRecipients(vehicle: Vehicle) {
    const recipients = ['fleet_manager']; // Toujours notifier le gestionnaire de flotte
    
    if (vehicle.currentDriver) {
      recipients.push(vehicle.currentDriver.id);
    }
    
    return recipients;
  }
}
