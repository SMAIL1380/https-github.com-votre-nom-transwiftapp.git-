import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DocumentVerification, DocumentType, VerificationStatus } from '../entities/document-verification.entity';

@Injectable()
export class DocumentStatsService {
  constructor(
    @InjectRepository(DocumentVerification)
    private documentVerificationRepository: Repository<DocumentVerification>,
  ) {}

  async getVerificationStats(startDate: Date, endDate: Date): Promise<any> {
    const documents = await this.documentVerificationRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['driver'],
    });

    const stats = {
      total: documents.length,
      byStatus: {
        [VerificationStatus.PENDING]: 0,
        [VerificationStatus.VERIFIED]: 0,
        [VerificationStatus.REJECTED]: 0,
        [VerificationStatus.EXPIRED]: 0,
      },
      byType: Object.values(DocumentType).reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {}),
      autoVerificationSuccess: 0,
      autoVerificationTotal: 0,
      averageVerificationTime: 0,
      expiringNext30Days: 0,
      expired: 0,
    };

    let totalVerificationTime = 0;
    let verificationTimeCount = 0;

    for (const doc of documents) {
      // Stats par statut
      stats.byStatus[doc.status]++;

      // Stats par type
      stats.byType[doc.documentType]++;

      // Stats de vérification automatique
      if (doc.isAutoVerified) {
        stats.autoVerificationTotal++;
        if (doc.status === VerificationStatus.VERIFIED) {
          stats.autoVerificationSuccess++;
        }
      }

      // Temps moyen de vérification
      if (doc.verificationDetails?.verificationDate) {
        const verificationTime = new Date(doc.verificationDetails.verificationDate).getTime() - doc.createdAt.getTime();
        totalVerificationTime += verificationTime;
        verificationTimeCount++;
      }

      // Documents expirants/expirés
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      if (doc.expiryDate < now) {
        stats.expired++;
      } else if (doc.expiryDate < thirtyDaysFromNow) {
        stats.expiringNext30Days++;
      }
    }

    // Calculer le temps moyen de vérification
    stats.averageVerificationTime = verificationTimeCount > 0
      ? totalVerificationTime / verificationTimeCount
      : 0;

    // Calculer le taux de succès de vérification automatique
    stats.autoVerificationRate = stats.autoVerificationTotal > 0
      ? (stats.autoVerificationSuccess / stats.autoVerificationTotal) * 100
      : 0;

    return stats;
  }

  async getDriverComplianceStats(): Promise<any> {
    const drivers = await this.documentVerificationRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.driver', 'driver')
      .select([
        'driver.id',
        'driver.firstName',
        'driver.lastName',
        'driver.driverType',
        'COUNT(doc.id) as totalDocuments',
        'SUM(CASE WHEN doc.status = :verified THEN 1 ELSE 0 END) as verifiedDocuments',
        'SUM(CASE WHEN doc.status = :expired THEN 1 ELSE 0 END) as expiredDocuments',
      ])
      .setParameter('verified', VerificationStatus.VERIFIED)
      .setParameter('expired', VerificationStatus.EXPIRED)
      .groupBy('driver.id')
      .getRawMany();

    return drivers.map(driver => ({
      driverId: driver.driver_id,
      firstName: driver.driver_firstName,
      lastName: driver.driver_lastName,
      driverType: driver.driver_driverType,
      complianceRate: (driver.verifiedDocuments / driver.totalDocuments) * 100,
      totalDocuments: parseInt(driver.totalDocuments),
      verifiedDocuments: parseInt(driver.verifiedDocuments),
      expiredDocuments: parseInt(driver.expiredDocuments),
    }));
  }

  async getVerificationTrends(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const verifications = await this.documentVerificationRepository
      .createQueryBuilder('doc')
      .select([
        'DATE(doc.createdAt) as date',
        'COUNT(doc.id) as total',
        'SUM(CASE WHEN doc.status = :verified THEN 1 ELSE 0 END) as verified',
        'SUM(CASE WHEN doc.status = :rejected THEN 1 ELSE 0 END) as rejected',
        'SUM(CASE WHEN doc.isAutoVerified = true THEN 1 ELSE 0 END) as autoVerified',
      ])
      .setParameter('verified', VerificationStatus.VERIFIED)
      .setParameter('rejected', VerificationStatus.REJECTED)
      .where('doc.createdAt >= :startDate', { startDate })
      .groupBy('DATE(doc.createdAt)')
      .orderBy('DATE(doc.createdAt)', 'ASC')
      .getRawMany();

    return verifications.map(v => ({
      date: v.date,
      total: parseInt(v.total),
      verified: parseInt(v.verified),
      rejected: parseInt(v.rejected),
      autoVerified: parseInt(v.autoVerified),
      verificationRate: (parseInt(v.verified) / parseInt(v.total)) * 100,
    }));
  }

  async getDocumentExpirationForecast(months: number = 12): Promise<any> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const expirations = await this.documentVerificationRepository
      .createQueryBuilder('doc')
      .select([
        'DATE_FORMAT(doc.expiryDate, "%Y-%m") as month',
        'COUNT(doc.id) as total',
        'doc.documentType',
      ])
      .where('doc.expiryDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('DATE_FORMAT(doc.expiryDate, "%Y-%m")')
      .addGroupBy('doc.documentType')
      .orderBy('month', 'ASC')
      .getRawMany();

    return Object.values(DocumentType).map(type => ({
      documentType: type,
      expirations: expirations
        .filter(e => e.documentType === type)
        .map(e => ({
          month: e.month,
          total: parseInt(e.total),
        })),
    }));
  }
}
