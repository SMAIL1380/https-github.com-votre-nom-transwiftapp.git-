import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { DocumentVerification, DocumentType, VerificationStatus } from '../entities/document-verification.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { WebhookService } from '../services/webhook.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocumentVerificationService {
  constructor(
    @InjectRepository(DocumentVerification)
    private documentVerificationRepository: Repository<DocumentVerification>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    private notificationsService: NotificationsService,
    private webhookService: WebhookService,
    private configService: ConfigService,
  ) {}

  async createVerification(
    driverId: string,
    documentType: DocumentType,
    documentUrl: string,
    documentNumber: string,
    issueDate: Date,
    expiryDate: Date,
    metadata?: any,
  ): Promise<DocumentVerification> {
    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Chauffeur non trouvé');
    }

    const verification = this.documentVerificationRepository.create({
      driver,
      documentType,
      documentUrl,
      documentNumber,
      issueDate,
      expiryDate,
      metadata,
      status: VerificationStatus.PENDING,
    });

    const savedVerification = await this.documentVerificationRepository.save(verification);

    // Lancer la vérification automatique si disponible
    if (this.shouldAutoVerify(documentType)) {
      await this.initiateAutoVerification(savedVerification);
    }

    return savedVerification;
  }

  private shouldAutoVerify(documentType: DocumentType): boolean {
    const autoVerifyTypes = [
      DocumentType.URSSAF_CERTIFICATE,
      DocumentType.VAT_CERTIFICATE,
      DocumentType.KBIS,
    ];
    return autoVerifyTypes.includes(documentType);
  }

  async initiateAutoVerification(verification: DocumentVerification): Promise<void> {
    verification.verificationAttempts += 1;
    verification.lastVerificationAttempt = new Date();
    await this.documentVerificationRepository.save(verification);

    try {
      let verificationResult;
      switch (verification.documentType) {
        case DocumentType.URSSAF_CERTIFICATE:
          verificationResult = await this.webhookService.verifyUrssaf(
            verification.documentNumber,
            verification.metadata,
          );
          break;
        case DocumentType.VAT_CERTIFICATE:
          verificationResult = await this.webhookService.verifyVat(
            verification.documentNumber,
          );
          break;
        case DocumentType.KBIS:
          verificationResult = await this.webhookService.verifyKbis(
            verification.documentNumber,
          );
          break;
      }

      await this.updateVerificationStatus(
        verification.id,
        verificationResult.isValid ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED,
        {
          verificationMethod: 'AUTO',
          verificationResult: verificationResult.isValid ? 'VALID' : 'INVALID',
          apiResponse: verificationResult,
          rejectionReason: verificationResult.reason,
        },
      );
    } catch (error) {
      console.error('Auto-verification failed:', error);
      // Ne pas changer le statut en cas d'erreur, permettre une nouvelle tentative
    }
  }

  async updateVerificationStatus(
    verificationId: string,
    status: VerificationStatus,
    details: any,
  ): Promise<DocumentVerification> {
    const verification = await this.documentVerificationRepository.findOne({
      where: { id: verificationId },
      relations: ['driver'],
    });

    if (!verification) {
      throw new NotFoundException('Vérification non trouvée');
    }

    verification.status = status;
    verification.verificationDetails = {
      ...verification.verificationDetails,
      ...details,
      verificationDate: new Date(),
    };

    const savedVerification = await this.documentVerificationRepository.save(verification);

    // Notifier le chauffeur du résultat
    await this.notificationsService.create(
      status === VerificationStatus.VERIFIED
        ? 'DOCUMENT_VERIFIED'
        : 'DOCUMENT_REJECTED',
      'Vérification de document',
      `Votre document ${verification.documentType} a été ${
        status === VerificationStatus.VERIFIED ? 'vérifié' : 'rejeté'
      }`,
      verification.driver.id,
      { documentType: verification.documentType, ...details },
    );

    return savedVerification;
  }

  async checkExpiringDocuments(daysThreshold: number = 30): Promise<DocumentVerification[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysThreshold);

    return this.documentVerificationRepository.find({
      where: {
        status: VerificationStatus.VERIFIED,
        expiryDate: Between(new Date(), futureDate),
      },
      relations: ['driver'],
    });
  }

  async getExpiredDocuments(): Promise<DocumentVerification[]> {
    return this.documentVerificationRepository.find({
      where: {
        status: VerificationStatus.VERIFIED,
        expiryDate: LessThan(new Date()),
      },
      relations: ['driver'],
    });
  }

  async getDriverDocuments(driverId: string): Promise<DocumentVerification[]> {
    return this.documentVerificationRepository.find({
      where: {
        driver: { id: driverId },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getDocumentsByStatus(status: VerificationStatus): Promise<DocumentVerification[]> {
    return this.documentVerificationRepository.find({
      where: { status },
      relations: ['driver'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async retryAutoVerification(verificationId: string): Promise<void> {
    const verification = await this.documentVerificationRepository.findOne({
      where: { id: verificationId },
    });

    if (!verification) {
      throw new NotFoundException('Vérification non trouvée');
    }

    if (!this.shouldAutoVerify(verification.documentType)) {
      throw new BadRequestException('Ce document ne supporte pas la vérification automatique');
    }

    await this.initiateAutoVerification(verification);
  }
}
