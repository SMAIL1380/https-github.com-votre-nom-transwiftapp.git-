import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DocumentVerificationService } from '../services/document-verification.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { WebhookService } from '../services/webhook.service';

@Injectable()
export class DocumentCheckTask {
  constructor(
    private readonly documentVerificationService: DocumentVerificationService,
    private readonly notificationsService: NotificationsService,
    private readonly webhookService: WebhookService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkDocuments() {
    await this.checkExpiringDocuments();
    await this.checkExpiredDocuments();
  }

  private async checkExpiringDocuments() {
    const expiringDocs = await this.documentVerificationService.checkExpiringDocuments(30);

    for (const doc of expiringDocs) {
      // Notifier le chauffeur
      await this.notificationsService.create(
        'DOCUMENT_EXPIRING',
        'Document expirant bientôt',
        `Votre document ${doc.documentType} expire le ${doc.expiryDate.toLocaleDateString()}`,
        doc.driver.id,
        {
          documentType: doc.documentType,
          expiryDate: doc.expiryDate,
        },
      );

      // Notifier les systèmes externes
      await this.webhookService.notifyExternalSystems('document.expiring', {
        documentId: doc.id,
        documentType: doc.documentType,
        driverId: doc.driver.id,
        expiryDate: doc.expiryDate,
      });
    }
  }

  private async checkExpiredDocuments() {
    const expiredDocs = await this.documentVerificationService.getExpiredDocuments();

    for (const doc of expiredDocs) {
      // Notifier le chauffeur
      await this.notificationsService.create(
        'DOCUMENT_EXPIRED',
        'Document expiré',
        `Votre document ${doc.documentType} a expiré`,
        doc.driver.id,
        {
          documentType: doc.documentType,
          expiryDate: doc.expiryDate,
        },
      );

      // Notifier les systèmes externes
      await this.webhookService.notifyExternalSystems('document.expired', {
        documentId: doc.id,
        documentType: doc.documentType,
        driverId: doc.driver.id,
        expiryDate: doc.expiryDate,
      });
    }
  }
}
