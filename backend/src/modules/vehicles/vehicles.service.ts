import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { Driver } from '../drivers/entities/driver.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const existingVehicle = await this.vehicleRepository.findOne({
      where: { plateNumber: createVehicleDto.plateNumber },
    });

    if (existingVehicle) {
      throw new BadRequestException('Un véhicule avec cette plaque existe déjà');
    }

    const vehicle = this.vehicleRepository.create(createVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      relations: ['driver'],
    });
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['driver'],
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    return vehicle;
  }

  async update(id: string, updateVehicleDto: Partial<CreateVehicleDto>): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    Object.assign(vehicle, updateVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: string): Promise<void> {
    const vehicle = await this.findOne(id);
    await this.vehicleRepository.remove(vehicle);
  }

  async assignToDriver(vehicleId: string, driverId: string): Promise<Vehicle> {
    const vehicle = await this.findOne(vehicleId);
    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
      relations: ['vehicle'],
    });

    if (!driver) {
      throw new NotFoundException('Chauffeur non trouvé');
    }

    if (driver.vehicle) {
      throw new BadRequestException('Le chauffeur a déjà un véhicule assigné');
    }

    if (vehicle.driver) {
      throw new BadRequestException('Le véhicule est déjà assigné à un chauffeur');
    }

    driver.vehicle = vehicle;
    await this.driverRepository.save(driver);
    return this.findOne(vehicleId);
  }

  async unassignFromDriver(vehicleId: string): Promise<Vehicle> {
    const vehicle = await this.findOne(vehicleId);
    
    if (!vehicle.driver) {
      throw new BadRequestException('Le véhicule n\'est pas assigné à un chauffeur');
    }

    const driver = await this.driverRepository.findOne({
      where: { id: vehicle.driver.id },
    });

    driver.vehicle = null;
    await this.driverRepository.save(driver);
    return this.findOne(vehicleId);
  }

  async checkExpiredInsurance(): Promise<Vehicle[]> {
    const today = new Date();
    return this.vehicleRepository.find({
      where: {
        insuranceExpiryDate: LessThan(today),
      },
      relations: ['driver'],
    });
  }

  async checkExpiringInsurance(days: number = 30): Promise<Vehicle[]> {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    return this.vehicleRepository.find({
      where: {
        insuranceExpiryDate: Between(today, futureDate),
      },
      relations: ['driver'],
    });
  }

  async checkExpiredTechnicalInspection(): Promise<Vehicle[]> {
    const today = new Date();
    return this.vehicleRepository.find({
      where: {
        technicalInspectionDate: LessThan(today),
      },
      relations: ['driver'],
    });
  }

  async getVehicleMaintenanceStatus(id: string): Promise<any> {
    const vehicle = await this.findOne(id);
    const today = new Date();

    const insuranceStatus = vehicle.insuranceExpiryDate
      ? vehicle.insuranceExpiryDate > today
        ? 'valid'
        : 'expired'
      : 'unknown';

    const technicalInspectionStatus = vehicle.technicalInspectionDate
      ? vehicle.technicalInspectionDate > today
        ? 'valid'
        : 'expired'
      : 'unknown';

    const daysUntilInsuranceExpiry = vehicle.insuranceExpiryDate
      ? Math.ceil((vehicle.insuranceExpiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const daysUntilTechnicalInspection = vehicle.technicalInspectionDate
      ? Math.ceil((vehicle.technicalInspectionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      vehicle,
      maintenanceStatus: {
        insurance: {
          status: insuranceStatus,
          daysUntilExpiry: daysUntilInsuranceExpiry,
          expiryDate: vehicle.insuranceExpiryDate,
        },
        technicalInspection: {
          status: technicalInspectionStatus,
          daysUntilExpiry: daysUntilTechnicalInspection,
          expiryDate: vehicle.technicalInspectionDate,
        },
      },
    };
  }
}
