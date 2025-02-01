import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverBankDetails } from '../entities/driver-bank-details.entity';
import { Driver } from '../entities/driver.entity';
import { AdminNotificationService } from '../../admin/services/admin-notification.service';

@Injectable()
export class DriverBankDetailsService {
  constructor(
    @InjectRepository(DriverBankDetails)
    private bankDetailsRepository: Repository<DriverBankDetails>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    private adminNotificationService: AdminNotificationService,
  ) {}

  async getBankDetails(driverId: string): Promise<DriverBankDetails> {
    const bankDetails = await this.bankDetailsRepository.findOne({
      where: { driverId },
    });

    if (!bankDetails) {
      throw new NotFoundException('Bank details not found');
    }

    return bankDetails;
  }

  async updateBankDetails(
    driverId: string,
    data: { iban: string; bic: string },
  ): Promise<DriverBankDetails> {
    let bankDetails = await this.bankDetailsRepository.findOne({
      where: { driverId },
    });

    if (!bankDetails) {
      // Créer une nouvelle entrée si elle n'existe pas
      bankDetails = this.bankDetailsRepository.create({
        driverId,
        ...data,
        isVerified: false,
        lastUpdated: new Date(),
      });
    } else {
      // Mettre à jour les détails existants
      Object.assign(bankDetails, {
        ...data,
        isVerified: false,
        lastUpdated: new Date(),
      });
    }

    await this.bankDetailsRepository.save(bankDetails);

    // Notifier les administrateurs du changement
    await this.adminNotificationService.notifyBankDetailsUpdate({
      driverId,
      iban: data.iban,
      bic: data.bic,
      timestamp: new Date(),
    });

    return bankDetails;
  }

  async verifyBankDetails(
    driverId: string,
    adminId: string,
  ): Promise<DriverBankDetails> {
    const bankDetails = await this.bankDetailsRepository.findOne({
      where: { driverId },
    });

    if (!bankDetails) {
      throw new NotFoundException('Bank details not found');
    }

    bankDetails.isVerified = true;
    await this.bankDetailsRepository.save(bankDetails);

    // Mettre à jour le statut du chauffeur si nécessaire
    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
    });

    if (driver) {
      driver.bankDetailsVerified = true;
      await this.driverRepository.save(driver);
    }

    return bankDetails;
  }

  async validateBankDetails(iban: string, bic: string): Promise<boolean> {
    // Validation IBAN
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
    if (!ibanRegex.test(iban.replace(/\s/g, ''))) {
      throw new BadRequestException('Invalid IBAN format');
    }

    // Validation BIC
    const bicRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    if (!bicRegex.test(bic)) {
      throw new BadRequestException('Invalid BIC format');
    }

    return true;
  }
}
