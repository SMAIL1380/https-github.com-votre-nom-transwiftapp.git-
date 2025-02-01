import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArchivedDocument } from '../entities/archived-document.entity';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ArchiveRequest {
  type: string;
  reference: string;
  date: Date;
  content: Buffer;
  metadata: Record<string, any>;
}

@Injectable()
export class ArchiveService {
  private readonly archivePath: string;
  private readonly retentionYears = 10; // Conservation légale de 10 ans

  constructor(
    @InjectRepository(ArchivedDocument)
    private archiveRepo: Repository<ArchivedDocument>,
    private configService: ConfigService,
  ) {
    this.archivePath = this.configService.get<string>('ARCHIVE_PATH');
  }

  async archiveDocument(request: ArchiveRequest): Promise<void> {
    // Générer un hash du document
    const hash = this.generateHash(request.content);

    // Créer le chemin d'archivage
    const archivePath = this.createArchivePath(request.date, request.type);
    const filename = `${request.reference}_${hash}.pdf`;
    const fullPath = path.join(archivePath, filename);

    // Sauvegarder le fichier
    await fs.mkdir(archivePath, { recursive: true });
    await fs.writeFile(fullPath, request.content);

    // Créer l'entrée dans la base de données
    const archive = this.archiveRepo.create({
      type: request.type,
      reference: request.reference,
      path: fullPath,
      hash,
      metadata: request.metadata,
      archiveDate: new Date(),
      retentionDate: this.calculateRetentionDate(request.date),
      size: request.content.length,
      status: 'ARCHIVED',
    });

    await this.archiveRepo.save(archive);
  }

  async verifyDocument(reference: string): Promise<{
    isValid: boolean;
    details?: string;
  }> {
    const archive = await this.archiveRepo.findOne({
      where: { reference },
    });

    if (!archive) {
      return { isValid: false, details: 'Document non trouvé dans les archives' };
    }

    try {
      // Lire le fichier
      const content = await fs.readFile(archive.path);

      // Vérifier le hash
      const currentHash = this.generateHash(content);
      const isValid = currentHash === archive.hash;

      return {
        isValid,
        details: isValid
          ? 'Document vérifié et authentique'
          : 'Le document a été modifié depuis son archivage',
      };
    } catch (error) {
      return {
        isValid: false,
        details: `Erreur lors de la vérification: ${error.message}`,
      };
    }
  }

  async retrieveDocument(reference: string): Promise<Buffer> {
    const archive = await this.archiveRepo.findOne({
      where: { reference },
    });

    if (!archive) {
      throw new Error('Document non trouvé dans les archives');
    }

    try {
      const content = await fs.readFile(archive.path);
      
      // Vérifier l'intégrité
      const currentHash = this.generateHash(content);
      if (currentHash !== archive.hash) {
        throw new Error('Le document a été modifié depuis son archivage');
      }

      return content;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }
  }

  private generateHash(content: Buffer): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private createArchivePath(date: Date, type: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return path.join(this.archivePath, type, String(year), month);
  }

  private calculateRetentionDate(date: Date): Date {
    const retentionDate = new Date(date);
    retentionDate.setFullYear(retentionDate.getFullYear() + this.retentionYears);
    return retentionDate;
  }

  async cleanupExpiredDocuments(): Promise<void> {
    const expiredDocuments = await this.archiveRepo.find({
      where: {
        retentionDate: LessThan(new Date()),
        status: 'ARCHIVED',
      },
    });

    for (const doc of expiredDocuments) {
      try {
        // Supprimer le fichier
        await fs.unlink(doc.path);

        // Mettre à jour le statut
        doc.status = 'DELETED';
        await this.archiveRepo.save(doc);
      } catch (error) {
        console.error(`Erreur lors de la suppression de ${doc.reference}:`, error);
      }
    }
  }

  async generateAuditReport(): Promise<Buffer> {
    const archives = await this.archiveRepo.find({
      order: {
        archiveDate: 'DESC',
      },
    });

    // Générer un rapport d'audit au format PDF
    const report = {
      totalDocuments: archives.length,
      totalSize: archives.reduce((acc, doc) => acc + doc.size, 0),
      byType: this.groupByType(archives),
      byStatus: this.groupByStatus(archives),
      details: archives.map(doc => ({
        reference: doc.reference,
        type: doc.type,
        archiveDate: doc.archiveDate,
        retentionDate: doc.retentionDate,
        status: doc.status,
        size: doc.size,
        hash: doc.hash,
      })),
    };

    // TODO: Implémenter la génération du PDF
    return Buffer.from(JSON.stringify(report, null, 2));
  }

  private groupByType(archives: ArchivedDocument[]): Record<string, number> {
    return archives.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {});
  }

  private groupByStatus(archives: ArchivedDocument[]): Record<string, number> {
    return archives.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {});
  }
}
