import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ExternalDriverRegistration, RegistrationStatus } from '../entities/external-driver-registration.entity';
import { ExternalDriverRegistrationDto } from '../dtos/external-driver-registration.dto';
import { MailService } from '../../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { Driver } from '../entities/driver.entity';

@Injectable()
export class ExternalDriverRegistrationService {
  constructor(
    @InjectRepository(ExternalDriverRegistration)
    private registrationRepository: Repository<ExternalDriverRegistration>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async submitRegistration(dto: ExternalDriverRegistrationDto): Promise<ExternalDriverRegistration> {
    // Vérifier si l'email existe déjà
    const existingRegistration = await this.registrationRepository.findOne({
      where: [
        { email: dto.email },
        { phoneNumber: dto.phoneNumber },
        { licenseNumber: dto.licenseNumber },
      ],
    });

    if (existingRegistration) {
      throw new BadRequestException('Une inscription avec ces informations existe déjà');
    }

    // Créer la nouvelle inscription
    const registration = this.registrationRepository.create({
      ...dto,
      status: RegistrationStatus.PENDING,
    });

    await this.registrationRepository.save(registration);

    // Envoyer email de confirmation de soumission
    await this.mailService.sendRegistrationSubmitted(
      registration.email,
      registration.firstName,
    );

    return registration;
  }

  async approveRegistration(
    registrationId: string,
    adminId: string,
    comment?: string,
  ): Promise<ExternalDriverRegistration> {
    const registration = await this.registrationRepository.findOne({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Inscription non trouvée');
    }

    if (registration.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException('Cette inscription a déjà été traitée');
    }

    // Générer le token d'activation
    const activationToken = uuidv4();
    const activationTokenExpiry = new Date();
    activationTokenExpiry.setHours(activationTokenExpiry.getHours() + 72); // Valide 72 heures

    // Mettre à jour l'inscription
    registration.status = RegistrationStatus.APPROVED;
    registration.reviewedBy = adminId;
    registration.reviewedAt = new Date();
    registration.adminComment = comment;
    registration.activationToken = activationToken;
    registration.activationTokenExpiry = activationTokenExpiry;

    await this.registrationRepository.save(registration);

    // Envoyer l'email avec le lien d'activation
    const activationLink = `${this.configService.get('MOBILE_APP_URL')}/activate?token=${activationToken}`;
    await this.mailService.sendRegistrationApproved(
      registration.email,
      registration.firstName,
      activationLink,
    );

    return registration;
  }

  async rejectRegistration(
    registrationId: string,
    adminId: string,
    reason: string,
  ): Promise<ExternalDriverRegistration> {
    const registration = await this.registrationRepository.findOne({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Inscription non trouvée');
    }

    if (registration.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException('Cette inscription a déjà été traitée');
    }

    // Mettre à jour l'inscription
    registration.status = RegistrationStatus.REJECTED;
    registration.reviewedBy = adminId;
    registration.reviewedAt = new Date();
    registration.adminComment = reason;

    await this.registrationRepository.save(registration);

    // Envoyer l'email de rejet
    await this.mailService.sendRegistrationRejected(
      registration.email,
      registration.firstName,
      reason,
    );

    return registration;
  }

  async completeRegistration(
    token: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> {
    const registration = await this.registrationRepository.findOne({
      where: { activationToken: token },
    });

    if (!registration) {
      throw new NotFoundException('Token d\'activation invalide');
    }

    if (registration.status !== RegistrationStatus.APPROVED) {
      throw new BadRequestException('Cette inscription n\'est pas approuvée');
    }

    if (new Date() > registration.activationTokenExpiry) {
      throw new BadRequestException('Le token d\'activation a expiré');
    }

    // Créer le compte chauffeur
    const driver = this.driverRepository.create({
      email: registration.email,
      firstName: registration.firstName,
      lastName: registration.lastName,
      phoneNumber: registration.phoneNumber,
      licenseNumber: registration.licenseNumber,
      licenseExpiryDate: registration.licenseExpiryDate,
      password, // Sera hashé par le subscriber
      type: 'EXTERNAL',
      companyInfo: registration.companyInfo,
      status: 'ACTIVE',
    });

    await this.driverRepository.save(driver);

    // Mettre à jour le statut de l'inscription
    registration.status = RegistrationStatus.COMPLETED;
    await this.registrationRepository.save(registration);

    // Envoyer l'email de bienvenue
    await this.mailService.sendWelcomeDriver(
      driver.email,
      driver.firstName,
    );

    return {
      success: true,
      message: 'Compte créé avec succès',
    };
  }

  async getPendingRegistrations(): Promise<ExternalDriverRegistration[]> {
    return this.registrationRepository.find({
      where: { status: RegistrationStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
  }

  async getRegistrationByToken(token: string): Promise<ExternalDriverRegistration> {
    const registration = await this.registrationRepository.findOne({
      where: { activationToken: token },
    });

    if (!registration) {
      throw new NotFoundException('Token d\'activation invalide');
    }

    return registration;
  }
}
