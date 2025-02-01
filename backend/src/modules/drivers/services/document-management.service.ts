import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus, DocumentType } from '../entities/document.entity';
import { Driver } from '../entities/driver.entity';
import { Vehicle } from '../entities/vehicle.entity';
import * as crypto from 'crypto';

@Injectable()
export class DocumentManagementService {
  constructor(
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
    @InjectRepository(Driver)
    private driverRepo: Repository<Driver>,
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
  ) {}

  // Création et mise à jour des documents
  async createDocument(data: Partial<Document>): Promise<Document> {
    const document = this.documentRepo.create(data);

    // Générer un hash pour l'intégrité du document
    if (data.fileUrl) {
      document.metadata = {
        ...document.metadata,
        hash: await this.generateFileHash(data.fileUrl),
      };
    }

    return this.documentRepo.save(document);
  }

  async updateDocumentStatus(
    id: string,
    status: DocumentStatus,
    verificationData?: any,
  ): Promise<Document> {
    const document = await this.documentRepo.findOne({ where: { id } });

    document.status = status;
    if (verificationData) {
      document.verification = {
        ...document.verification,
        ...verificationData,
        verifiedAt: new Date(),
      };
    }

    return this.documentRepo.save(document);
  }

  // Vérification et validation
  async verifyDocument(id: string, userId: string): Promise<Document> {
    const document = await this.documentRepo.findOne({ where: { id } });

    // Vérifier l'intégrité du document
    const currentHash = await this.generateFileHash(document.fileUrl);
    const isValid = currentHash === document.metadata.hash;

    if (!isValid) {
      throw new Error('Document integrity check failed');
    }

    return this.updateDocumentStatus(id, DocumentStatus.VALID, {
      verifiedBy: userId,
      comments: 'Document vérifié et validé',
    });
  }

  // Gestion des rappels
  async setupDocumentReminders(
    id: string,
    reminderDays: number[],
  ): Promise<Document> {
    const document = await this.documentRepo.findOne({ where: { id } });

    document.reminders = {
      enabled: true,
      daysBeforeExpiry: reminderDays,
      lastReminder: null,
      nextReminder: this.calculateNextReminder(document.expiryDate, reminderDays),
    };

    return this.documentRepo.save(document);
  }

  async checkExpiringDocuments(): Promise<Document[]> {
    const documents = await this.documentRepo.find({
      where: {
        status: DocumentStatus.VALID,
        'reminders.enabled': true,
      },
    });

    const expiringDocs = documents.filter(doc => {
      if (!doc.reminders?.nextReminder) return false;
      return new Date() >= doc.reminders.nextReminder;
    });

    // Mettre à jour les rappels pour les documents expirés
    for (const doc of expiringDocs) {
      doc.reminders.lastReminder = new Date();
      doc.reminders.nextReminder = this.calculateNextReminder(
        doc.expiryDate,
        doc.reminders.daysBeforeExpiry,
      );
      await this.documentRepo.save(doc);
    }

    return expiringDocs;
  }

  // Archivage
  async archiveDocument(id: string): Promise<Document> {
    const document = await this.documentRepo.findOne({ where: { id } });

    document.archive = {
      archiveDate: new Date(),
      retentionPeriod: 10 * 365, // 10 ans en jours
      deleteAfter: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
      archiveLocation: `archives/${document.type}/${document.id}`,
    };

    return this.documentRepo.save(document);
  }

  async cleanupExpiredDocuments(): Promise<void> {
    const expiredDocs = await this.documentRepo.find({
      where: {
        'archive.deleteAfter': {
          $lt: new Date(),
        },
      },
    });

    for (const doc of expiredDocs) {
      // Supprimer le fichier physique
      // await this.deleteFile(doc.fileUrl);
      
      // Marquer comme supprimé dans la base
      doc.deletedAt = new Date();
      await this.documentRepo.save(doc);
    }
  }

  // Rapports et statistiques
  async getDocumentStatistics(
    filters: {
      type?: DocumentType;
      status?: DocumentStatus;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ): Promise<any> {
    const query = this.documentRepo.createQueryBuilder('document');

    if (filters.type) {
      query.andWhere('document.type = :type', { type: filters.type });
    }

    if (filters.status) {
      query.andWhere('document.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      query.andWhere('document.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('document.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const documents = await query.getMany();

    return {
      total: documents.length,
      byType: this.groupDocumentsByType(documents),
      byStatus: this.groupDocumentsByStatus(documents),
      expiringIn30Days: documents.filter(
        doc =>
          doc.expiryDate &&
          doc.expiryDate.getTime() - Date.now() <= 30 * 24 * 60 * 60 * 1000,
      ).length,
    };
  }

  // Partage et accès
  async shareDocument(
    id: string,
    userId: string,
    expiresIn?: number,
  ): Promise<string> {
    const document = await this.documentRepo.findOne({ where: { id } });

    if (!document.sharedWith) {
      document.sharedWith = [];
    }

    document.sharedWith.push(userId);
    await this.documentRepo.save(document);

    // Générer un lien de partage temporaire
    const shareToken = crypto.randomBytes(32).toString('hex');
    // Stocker le token avec sa date d'expiration
    
    return shareToken;
  }

  // Utilitaires privés
  private async generateFileHash(fileUrl: string): Promise<string> {
    // Implémenter la logique de hachage du fichier
    return 'hash';
  }

  private calculateNextReminder(
    expiryDate: Date,
    reminderDays: number[],
  ): Date | null {
    const now = new Date();
    const daysUntilExpiry = Math.floor(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    const nextReminderDay = reminderDays.find(days => days <= daysUntilExpiry);
    if (!nextReminderDay) return null;

    return new Date(
      expiryDate.getTime() - nextReminderDay * 24 * 60 * 60 * 1000,
    );
  }

  private groupDocumentsByType(
    documents: Document[],
  ): Record<DocumentType, number> {
    return documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {});
  }

  private groupDocumentsByStatus(
    documents: Document[],
  ): Record<DocumentStatus, number> {
    return documents.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {});
  }
}
