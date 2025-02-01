import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Driver } from '../entities/driver.entity';
import { ExternalDriverInfo } from '../entities/external-driver-info.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { CreateInternalDriverDto } from '../dto/create-internal-driver.dto';
import { CreateExternalDriverDto } from '../dto/create-external-driver.dto';
import { DriverType } from '../enums/driver-type.enum';
import { RegistrationStatus } from '../enums/registration-status.enum';
import { NotificationsService } from '../../notifications/notifications.service';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class DriverRegistrationService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(ExternalDriverInfo)
    private externalDriverInfoRepository: Repository<ExternalDriverInfo>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    private notificationsService: NotificationsService,
    private mailService: MailService,
  ) {}

  async registerInternalDriver(dto: CreateInternalDriverDto): Promise<Driver> {
    const existingDriver = await this.driverRepository.findOne({
      where: [
        { email: dto.email },
        { phoneNumber: dto.phoneNumber },
        { socialSecurityNumber: dto.socialSecurityNumber },
      ],
    });

    if (existingDriver) {
      throw new BadRequestException('Un chauffeur avec ces informations existe déjà');
    }

    // Générer un token d'inscription temporaire
    const registrationToken = uuidv4();
    const registrationTokenExpiry = new Date();
    registrationTokenExpiry.setHours(registrationTokenExpiry.getHours() + 48);

    const driver = this.driverRepository.create({
      ...dto,
      driverType: DriverType.INTERNAL,
      registrationStatus: RegistrationStatus.PENDING,
      registrationToken,
      registrationTokenExpiry,
    });

    const savedDriver = await this.driverRepository.save(driver);

    // Envoyer l'email avec le lien d'inscription
    await this.mailService.sendRegistrationLink(
      savedDriver.email,
      savedDriver.firstName,
      registrationToken,
    );

    return savedDriver;
  }

  async registerExternalDriver(dto: CreateExternalDriverDto): Promise<Driver> {
    const existingDriver = await this.driverRepository.findOne({
      where: [
        { email: dto.email },
        { phoneNumber: dto.phoneNumber },
      ],
    });

    if (existingDriver) {
      throw new BadRequestException('Un chauffeur avec ces informations existe déjà');
    }

    // Créer le chauffeur
    const driver = this.driverRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      address: dto.address,
      driverType: DriverType.EXTERNAL,
      registrationStatus: RegistrationStatus.PENDING,
    });

    const savedDriver = await this.driverRepository.save(driver);

    // Créer les informations externes
    const externalInfo = this.externalDriverInfoRepository.create({
      companyName: dto.companyInfo.companyName,
      kbis: dto.companyInfo.kbis,
      vatNumber: dto.companyInfo.vatNumber,
      urssafCertificate: dto.companyInfo.urssafCertificate,
      cargoInsurance: dto.companyInfo.cargoInsurance,
      companyBankAccount: dto.companyInfo.companyBankAccount,
      driver: savedDriver,
    });

    await this.externalDriverInfoRepository.save(externalInfo);

    // Créer le véhicule
    const vehicle = this.vehicleRepository.create({
      brand: dto.vehicleInfo.brand,
      model: dto.vehicleInfo.model,
      plateNumber: dto.vehicleInfo.registrationNumber,
      type: dto.vehicleInfo.volume,
      dimensions: {
        volume: dto.vehicleInfo.volume,
        hasLiftgate: !!dto.vehicleInfo.liftgate,
        hasPlsc: !!dto.vehicleInfo.plsc,
      },
      driver: savedDriver,
    });

    await this.vehicleRepository.save(vehicle);

    // Notifier les administrateurs
    // TODO: Implémenter la notification aux administrateurs

    return savedDriver;
  }

  async completeInternalRegistration(token: string, password: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: {
        registrationToken: token,
        registrationStatus: RegistrationStatus.PENDING,
      },
    });

    if (!driver || driver.registrationTokenExpiry < new Date()) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    driver.password = hashedPassword;
    driver.registrationStatus = RegistrationStatus.APPROVED;
    driver.registrationToken = null;
    driver.registrationTokenExpiry = null;

    return this.driverRepository.save(driver);
  }

  async approveExternalDriver(driverId: string, adminId: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: {
        id: driverId,
        driverType: DriverType.EXTERNAL,
        registrationStatus: RegistrationStatus.PENDING,
      },
      relations: ['externalInfo'],
    });

    if (!driver) {
      throw new NotFoundException('Chauffeur externe non trouvé');
    }

    driver.registrationStatus = RegistrationStatus.APPROVED;
    driver.externalInfo.documentsValidatedAt = new Date();
    driver.externalInfo.validatedBy = adminId;

    const savedDriver = await this.driverRepository.save(driver);

    // Envoyer un email de confirmation
    await this.mailService.sendApprovalConfirmation(
      driver.email,
      driver.firstName,
    );

    return savedDriver;
  }

  async rejectExternalDriver(driverId: string, reason: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: {
        id: driverId,
        driverType: DriverType.EXTERNAL,
      },
    });

    if (!driver) {
      throw new NotFoundException('Chauffeur externe non trouvé');
    }

    driver.registrationStatus = RegistrationStatus.REJECTED;

    const savedDriver = await this.driverRepository.save(driver);

    // Envoyer un email de rejet
    await this.mailService.sendRejectionNotification(
      driver.email,
      driver.firstName,
      reason,
    );

    return savedDriver;
  }

  async requestAdditionalDocuments(
    driverId: string,
    documents: string[],
  ): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: {
        id: driverId,
        driverType: DriverType.EXTERNAL,
      },
    });

    if (!driver) {
      throw new NotFoundException('Chauffeur externe non trouvé');
    }

    driver.registrationStatus = RegistrationStatus.INCOMPLETE;

    const savedDriver = await this.driverRepository.save(driver);

    // Envoyer un email pour demander des documents supplémentaires
    await this.mailService.sendAdditionalDocumentsRequest(
      driver.email,
      driver.firstName,
      documents,
    );

    return savedDriver;
  }
}
