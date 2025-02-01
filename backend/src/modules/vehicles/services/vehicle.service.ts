import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from '../schemas/vehicle.schema';
import { MaintenanceRecord, MaintenanceRecordDocument } from '../schemas/maintenance-record.schema';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { CreateMaintenanceRecordDto } from '../dto/create-maintenance-record.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name)
    private vehicleModel: Model<VehicleDocument>,
    @InjectModel(MaintenanceRecord.name)
    private maintenanceModel: Model<MaintenanceRecordDocument>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = new this.vehicleModel(createVehicleDto);
    return await vehicle.save();
  }

  async findAll(filters?: any): Promise<Vehicle[]> {
    return await this.vehicleModel
      .find(filters)
      .populate('currentDriver')
      .populate('maintenanceRecords')
      .exec();
  }

  async findOne(id: string): Promise<Vehicle> {
    return await this.vehicleModel
      .findById(id)
      .populate('currentDriver')
      .populate('maintenanceRecords')
      .populate('deliveries')
      .exec();
  }

  async update(id: string, updateData: Partial<Vehicle>): Promise<Vehicle> {
    return await this.vehicleModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.vehicleModel.findByIdAndDelete(id).exec();
  }

  async assignDriver(vehicleId: string, driverId: string): Promise<Vehicle> {
    const vehicle = await this.findOne(vehicleId);
    if (vehicle.status !== 'AVAILABLE') {
      throw new Error('Vehicle is not available');
    }
    vehicle.currentDriver = { id: driverId } as any;
    vehicle.status = 'IN_USE';
    return await vehicle.save();
  }

  async unassignDriver(vehicleId: string): Promise<Vehicle> {
    const vehicle = await this.findOne(vehicleId);
    vehicle.currentDriver = null;
    vehicle.status = 'AVAILABLE';
    return await vehicle.save();
  }

  async addMaintenanceRecord(
    vehicleId: string,
    record: CreateMaintenanceRecordDto,
  ): Promise<MaintenanceRecord> {
    const vehicle = await this.findOne(vehicleId);
    const maintenanceRecord = new this.maintenanceModel({
      ...record,
      vehicle,
    });
    return await maintenanceRecord.save();
  }

  async updateFuelLevel(
    vehicleId: string,
    fuelLevel: number,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(vehicleId);
    if (fuelLevel < 0 || fuelLevel > vehicle.fuelCapacity) {
      throw new Error('Invalid fuel level');
    }
    vehicle.currentFuelLevel = fuelLevel;
    return await vehicle.save();
  }

  async updateMileage(
    vehicleId: string,
    mileage: number,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(vehicleId);
    if (mileage < vehicle.mileage) {
      throw new Error('New mileage cannot be less than current mileage');
    }
    vehicle.mileage = mileage;
    return await vehicle.save();
  }

  async getMaintenanceHistory(
    vehicleId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<MaintenanceRecord[]> {
    const where: any = { vehicle: { id: vehicleId } };
    if (startDate && endDate) {
      where.date = { $gte: startDate, $lte: endDate };
    }
    return await this.maintenanceModel
      .find(where)
      .sort({ date: -1 })
      .exec();
  }

  async getVehicleStats(vehicleId: string) {
    const vehicle = await this.findOne(vehicleId);
    const maintenanceRecords = await this.getMaintenanceHistory(vehicleId);

    const totalMaintenanceCost = maintenanceRecords.reduce(
      (sum, record) => sum + record.cost,
      0,
    );

    const deliveriesThisMonth = vehicle.deliveries.filter(
      delivery =>
        delivery.createdAt >= new Date(new Date().setDate(1)) &&
        delivery.status === 'completed',
    );

    return {
      totalDistance: vehicle.totalDistance,
      totalDeliveries: vehicle.totalDeliveries,
      totalMaintenanceCost,
      averageFuelConsumption:
        vehicle.totalDistance > 0
          ? (vehicle.fuelCapacity * vehicle.totalDeliveries) / vehicle.totalDistance
          : 0,
      deliveriesThisMonth: deliveriesThisMonth.length,
      maintenanceCount: maintenanceRecords.length,
      upcomingMaintenance: vehicle.nextMaintenanceDate,
    };
  }

  async checkMaintenanceNeeded(vehicleId: string): Promise<boolean> {
    const vehicle = await this.findOne(vehicleId);
    const lastMaintenance = vehicle.lastMaintenanceDate;
    const mileageSinceLastMaintenance =
      vehicle.mileage -
      (await this.maintenanceModel
        .findOne({ vehicle: { id: vehicleId } })
        .sort({ date: -1 })
        .exec())?.mileageAtService || 0;

    // Vérifier si la maintenance est nécessaire selon les critères
    return (
      !lastMaintenance ||
      Date.now() - lastMaintenance.getTime() > 90 * 24 * 60 * 60 * 1000 || // 90 jours
      mileageSinceLastMaintenance > 10000 // 10,000 km
    );
  }
}
