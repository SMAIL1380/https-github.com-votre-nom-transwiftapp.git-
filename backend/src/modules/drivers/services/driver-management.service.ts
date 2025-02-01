import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExternalDriver } from '../entities/external-driver.entity';
import { InternalDriver } from '../entities/internal-driver.entity';
import { Document } from '../entities/document.entity';

@Injectable()
export class DriverManagementService {
  constructor(
    @InjectRepository(ExternalDriver)
    private externalDriverRepo: Repository<ExternalDriver>,
    @InjectRepository(InternalDriver)
    private internalDriverRepo: Repository<InternalDriver>,
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
  ) {}

  // Gestion des chauffeurs externes
  async createExternalDriver(data: Partial<ExternalDriver>): Promise<ExternalDriver> {
    const driver = this.externalDriverRepo.create(data);
    return this.externalDriverRepo.save(driver);
  }

  async updateExternalDriver(
    id: string,
    data: Partial<ExternalDriver>,
  ): Promise<ExternalDriver> {
    await this.externalDriverRepo.update(id, data);
    return this.externalDriverRepo.findOne({ where: { id } });
  }

  async getExternalDrivers(filters?: any): Promise<ExternalDriver[]> {
    return this.externalDriverRepo.find({
      where: filters,
      relations: ['driver', 'deliveries'],
    });
  }

  // Gestion des chauffeurs internes
  async createInternalDriver(data: Partial<InternalDriver>): Promise<InternalDriver> {
    const driver = this.internalDriverRepo.create(data);
    return this.internalDriverRepo.save(driver);
  }

  async updateInternalDriver(
    id: string,
    data: Partial<InternalDriver>,
  ): Promise<InternalDriver> {
    await this.internalDriverRepo.update(id, data);
    return this.internalDriverRepo.findOne({ where: { id } });
  }

  async getInternalDrivers(filters?: any): Promise<InternalDriver[]> {
    return this.internalDriverRepo.find({
      where: filters,
      relations: ['driver', 'deliveries'],
    });
  }

  // Gestion des performances
  async updateDriverPerformance(
    driverId: string,
    isExternal: boolean,
    performanceData: any,
  ): Promise<void> {
    const repo = isExternal ? this.externalDriverRepo : this.internalDriverRepo;
    await repo.update(driverId, { performance: performanceData });
  }

  // Gestion des documents
  async validateDriverDocuments(driverId: string): Promise<boolean> {
    const documents = await this.documentRepo.find({
      where: { driver: { id: driverId } },
    });

    const requiredDocs = ['DRIVER_LICENSE', 'IDENTITY_CARD', 'INSURANCE'];
    const hasAllDocs = requiredDocs.every(docType =>
      documents.some(doc => doc.type === docType && doc.status === 'VALID'),
    );

    return hasAllDocs;
  }

  // Gestion des disponibilités
  async updateDriverAvailability(
    driverId: string,
    isExternal: boolean,
    isAvailable: boolean,
  ): Promise<void> {
    const repo = isExternal ? this.externalDriverRepo : this.internalDriverRepo;
    await repo.update(driverId, { isAvailable });
  }

  // Statistiques et rapports
  async getDriverStatistics(driverId: string, isExternal: boolean): Promise<any> {
    const repo = isExternal ? this.externalDriverRepo : this.internalDriverRepo;
    const driver = await repo.findOne({
      where: { id: driverId },
      relations: ['deliveries', 'incidents'],
    });

    return {
      totalDeliveries: driver.deliveries?.length || 0,
      performance: driver.performance,
      // Ajoutez d'autres statistiques selon vos besoins
    };
  }

  // Gestion des formations
  async addTraining(
    driverId: string,
    trainingData: any,
  ): Promise<InternalDriver> {
    const driver = await this.internalDriverRepo.findOne({
      where: { id: driverId },
    });

    if (!driver.trainingHistory) {
      driver.trainingHistory = [];
    }

    driver.trainingHistory.push({
      ...trainingData,
      date: new Date(),
    });

    return this.internalDriverRepo.save(driver);
  }

  // Gestion des bonus/malus
  async updateDriverBonus(
    driverId: string,
    isExternal: boolean,
    amount: number,
  ): Promise<void> {
    const repo = isExternal ? this.externalDriverRepo : this.internalDriverRepo;
    const driver = await repo.findOne({ where: { id: driverId } });

    if (isExternal) {
      driver.performance.bonusPoints += amount;
    } else {
      driver.performance.bonuses += amount;
    }

    await repo.save(driver);
  }
}
