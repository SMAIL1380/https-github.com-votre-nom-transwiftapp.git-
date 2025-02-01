import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle, VehicleStatus } from '../entities/vehicle.entity';
import { MaintenanceRecord } from '../entities/maintenance-record.entity';
import { Document } from '../entities/document.entity';

@Injectable()
export class VehicleManagementService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(MaintenanceRecord)
    private maintenanceRepo: Repository<MaintenanceRecord>,
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
  ) {}

  // Gestion des véhicules
  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = this.vehicleRepo.create(data);
    return this.vehicleRepo.save(vehicle);
  }

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    await this.vehicleRepo.update(id, data);
    return this.vehicleRepo.findOne({ where: { id } });
  }

  async getVehicles(filters?: any): Promise<Vehicle[]> {
    return this.vehicleRepo.find({
      where: filters,
      relations: ['currentDriver', 'maintenanceHistory'],
    });
  }

  // Gestion de la maintenance
  async scheduleMaintenanceRecord(
    data: Partial<MaintenanceRecord>,
  ): Promise<MaintenanceRecord> {
    const record = this.maintenanceRepo.create(data);

    // Mettre à jour le statut du véhicule
    await this.vehicleRepo.update(record.vehicle.id, {
      status: VehicleStatus.MAINTENANCE,
    });

    return this.maintenanceRepo.save(record);
  }

  async completeMaintenanceRecord(
    id: string,
    completionData: any,
  ): Promise<MaintenanceRecord> {
    const record = await this.maintenanceRepo.findOne({
      where: { id },
      relations: ['vehicle'],
    });

    record.completedDate = new Date();
    record.status = 'COMPLETED';
    Object.assign(record, completionData);

    // Mettre à jour le statut du véhicule
    await this.vehicleRepo.update(record.vehicle.id, {
      status: VehicleStatus.ACTIVE,
    });

    return this.maintenanceRepo.save(record);
  }

  // Suivi des documents
  async updateVehicleDocuments(
    vehicleId: string,
    documents: Partial<Document>[],
  ): Promise<void> {
    for (const doc of documents) {
      const document = this.documentRepo.create({
        ...doc,
        vehicle: { id: vehicleId },
      });
      await this.documentRepo.save(document);
    }
  }

  // Suivi de la localisation
  async updateVehicleLocation(
    vehicleId: string,
    location: { latitude: number; longitude: number },
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleRepo.findOne({ where: { id: vehicleId } });
    
    vehicle.tracking = {
      ...vehicle.tracking,
      currentLocation: {
        ...location,
        lastUpdate: new Date(),
      },
    };

    return this.vehicleRepo.save(vehicle);
  }

  // Gestion du carburant
  async recordFuelRefill(
    vehicleId: string,
    data: {
      amount: number;
      cost: number;
      mileage: number;
    },
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleRepo.findOne({ where: { id: vehicleId } });

    vehicle.tracking = {
      ...vehicle.tracking,
      fuelLevel: data.amount,
      lastRefuel: {
        date: new Date(),
        amount: data.amount,
        cost: data.cost,
      },
      mileage: data.mileage,
    };

    return this.vehicleRepo.save(vehicle);
  }

  // Rapports et statistiques
  async getVehicleStatistics(vehicleId: string): Promise<any> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: vehicleId },
      relations: ['maintenanceHistory'],
    });

    const maintenanceCosts = vehicle.maintenanceHistory.reduce(
      (total, record) => total + record.totalCost,
      0,
    );

    return {
      totalMileage: vehicle.tracking.mileage,
      maintenanceCosts,
      fuelEfficiency: vehicle.performance.averageFuelConsumption,
      downtime: vehicle.performance.downtime,
      incidentCount: vehicle.performance.incidentCount,
    };
  }

  // Gestion des équipements
  async updateVehicleEquipment(
    vehicleId: string,
    equipment: {
      name: string;
      status: string;
    },
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleRepo.findOne({ where: { id: vehicleId } });

    const equipmentIndex = vehicle.equipments.findIndex(
      e => e.name === equipment.name,
    );

    if (equipmentIndex >= 0) {
      vehicle.equipments[equipmentIndex] = {
        ...equipment,
        lastCheck: new Date(),
      };
    } else {
      vehicle.equipments.push({
        ...equipment,
        lastCheck: new Date(),
      });
    }

    return this.vehicleRepo.save(vehicle);
  }

  // Planification de la maintenance
  async getMaintenanceSchedule(
    startDate: Date,
    endDate: Date,
  ): Promise<MaintenanceRecord[]> {
    return this.maintenanceRepo.find({
      where: {
        scheduledDate: {
          $gte: startDate,
          $lte: endDate,
        },
        status: 'SCHEDULED',
      },
      relations: ['vehicle'],
    });
  }
}
