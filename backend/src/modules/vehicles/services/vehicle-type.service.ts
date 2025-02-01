import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleType, VehicleCategory } from '../entities/vehicle-type.entity';

@Injectable()
export class VehicleTypeService {
  constructor(
    @InjectRepository(VehicleType)
    private vehicleTypeRepository: Repository<VehicleType>,
  ) {}

  async create(data: Partial<VehicleType>): Promise<VehicleType> {
    const vehicleType = this.vehicleTypeRepository.create(data);
    return this.vehicleTypeRepository.save(vehicleType);
  }

  async findAll(category?: VehicleCategory): Promise<VehicleType[]> {
    const query = this.vehicleTypeRepository.createQueryBuilder('vehicleType');

    if (category) {
      query.where('vehicleType.category = :category', { category });
    }

    return query
      .orderBy('vehicleType.category', 'ASC')
      .addOrderBy('vehicleType.name', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<VehicleType> {
    const vehicleType = await this.vehicleTypeRepository.findOne({
      where: { id },
      relations: ['vehicles'],
    });

    if (!vehicleType) {
      throw new NotFoundException(`Type de véhicule ${id} non trouvé`);
    }

    return vehicleType;
  }

  async update(id: string, data: Partial<VehicleType>): Promise<VehicleType> {
    await this.findOne(id);
    await this.vehicleTypeRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const vehicleType = await this.findOne(id);
    if (vehicleType.vehicles && vehicleType.vehicles.length > 0) {
      throw new Error('Impossible de supprimer un type de véhicule associé à des véhicules');
    }
    await this.vehicleTypeRepository.delete(id);
  }

  async getSpecifications(category: VehicleCategory): Promise<any> {
    const specifications = {
      [VehicleCategory.LIGHT_COMMERCIAL]: {
        maxWeight: 3.5,
        requiredLicense: 'B',
        cityAccess: true,
        commonFeatures: ['Hayon', 'GPS', 'Bluetooth'],
      },
      [VehicleCategory.HEAVY_COMMERCIAL]: {
        maxWeight: 44,
        requiredLicense: 'CE',
        cityAccess: false,
        commonFeatures: ['Hayon élévateur', 'GPS', 'Chronotachygraphe'],
      },
      [VehicleCategory.REFRIGERATED]: {
        temperatureRange: { min: -20, max: 4 },
        requiredLicense: ['B', 'C'],
        specialFeatures: ['Groupe frigorifique', 'Enregistreur de température'],
      },
      [VehicleCategory.SPECIALIZED]: {
        customizable: true,
        requiresSpecialPermit: true,
        specialFeatures: ['Selon configuration'],
      },
    };

    return specifications[category] || {};
  }

  async validateSpecifications(category: VehicleCategory, specs: any): Promise<boolean> {
    const baseSpecs = await this.getSpecifications(category);
    
    // Validation selon la catégorie
    switch (category) {
      case VehicleCategory.LIGHT_COMMERCIAL:
        return specs.maxWeight <= 3.5;
      
      case VehicleCategory.HEAVY_COMMERCIAL:
        return specs.maxWeight <= 44 && specs.requiredLicense === 'CE';
      
      case VehicleCategory.REFRIGERATED:
        return (
          specs.temperatureRange &&
          specs.temperatureRange.min >= -20 &&
          specs.temperatureRange.max <= 4
        );
      
      case VehicleCategory.SPECIALIZED:
        return true; // Validation personnalisée selon les besoins
      
      default:
        return false;
    }
  }
}
