import { Injectable } from '@nestjs/common';
import { DocumentStatsService } from './document-stats.service';
import { DocumentVerificationService } from './document-verification.service';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Injectable()
export class ReportGeneratorService {
  constructor(
    private readonly documentStatsService: DocumentStatsService,
    private readonly documentVerificationService: DocumentVerificationService,
  ) {}

  async generateComplianceReport(startDate: Date, endDate: Date): Promise<string> {
    const stats = await this.documentStatsService.getVerificationStats(startDate, endDate);
    const compliance = await this.documentStatsService.getDriverComplianceStats();
    const trends = await this.documentStatsService.getVerificationTrends(30);

    const doc = new PDFDocument();
    const fileName = `compliance-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // En-tête
    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('Rapport de Conformité des Documents', { align: 'center' })
      .moveDown()
      .fontSize(12)
      .text(`Période: ${format(startDate, 'dd MMMM yyyy', { locale: fr })} - ${format(endDate, 'dd MMMM yyyy', { locale: fr })}`)
      .moveDown(2);

    // Statistiques globales
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('1. Statistiques Globales')
      .moveDown()
      .font('Helvetica')
      .fontSize(12);

    doc.text(`Documents totaux: ${stats.total}`);
    doc.text(`Taux de vérification: ${(stats.byStatus.VERIFIED / stats.total * 100).toFixed(2)}%`);
    doc.text(`Taux de succès auto: ${stats.autoVerificationRate.toFixed(2)}%`);
    doc.moveDown();

    // Statistiques par type de document
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('2. Répartition par Type de Document')
      .moveDown()
      .font('Helvetica')
      .fontSize(12);

    Object.entries(stats.byType).forEach(([type, count]) => {
      doc.text(`${type}: ${count}`);
    });
    doc.moveDown();

    // Conformité des chauffeurs
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('3. Conformité des Chauffeurs')
      .moveDown()
      .font('Helvetica')
      .fontSize(12);

    compliance.forEach(driver => {
      doc.text(`${driver.firstName} ${driver.lastName}:`);
      doc.text(`  - Taux de conformité: ${driver.complianceRate.toFixed(2)}%`);
      doc.text(`  - Documents valides: ${driver.verifiedDocuments}/${driver.totalDocuments}`);
      doc.moveDown(0.5);
    });

    // Tendances
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('4. Tendances sur 30 Jours')
      .moveDown()
      .font('Helvetica')
      .fontSize(12);

    trends.forEach(trend => {
      doc.text(`${format(new Date(trend.date), 'dd/MM/yyyy')}:`);
      doc.text(`  - Vérifications: ${trend.total}`);
      doc.text(`  - Taux de succès: ${trend.verificationRate.toFixed(2)}%`);
      doc.moveDown(0.5);
    });

    // Recommandations
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('5. Recommandations')
      .moveDown()
      .font('Helvetica')
      .fontSize(12);

    const recommendations = this.generateRecommendations(stats, compliance);
    recommendations.forEach(rec => {
      doc.text(`• ${rec}`);
      doc.moveDown(0.5);
    });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  private generateRecommendations(stats: any, compliance: any[]): string[] {
    const recommendations = [];

    // Recommandations basées sur les taux de vérification
    if (stats.autoVerificationRate < 70) {
      recommendations.push(
        'Améliorer le taux de vérification automatique en vérifiant la qualité des documents soumis',
      );
    }

    // Recommandations basées sur la conformité des chauffeurs
    const lowComplianceDrivers = compliance.filter(d => d.complianceRate < 80);
    if (lowComplianceDrivers.length > 0) {
      recommendations.push(
        `${lowComplianceDrivers.length} chauffeur(s) ont un taux de conformité inférieur à 80%. Un suivi particulier est recommandé.`,
      );
    }

    // Recommandations générales
    if (stats.expiringNext30Days > 0) {
      recommendations.push(
        `${stats.expiringNext30Days} documents vont expirer dans les 30 prochains jours. Planifier les renouvellements.`,
      );
    }

    return recommendations;
  }

  async generateExpirationReport(): Promise<string> {
    const forecast = await this.documentStatsService.getDocumentExpirationForecast(12);
    const doc = new PDFDocument();
    const fileName = `expiration-forecast-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // En-tête
    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('Prévisions des Expirations de Documents', { align: 'center' })
      .moveDown()
      .fontSize(12)
      .text(`Généré le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`)
      .moveDown(2);

    // Prévisions par type de document
    forecast.forEach(typeData => {
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text(`${typeData.documentType}`)
        .moveDown()
        .font('Helvetica')
        .fontSize(12);

      typeData.expirations.forEach(exp => {
        doc.text(`${exp.month}: ${exp.total} document(s)`);
      });
      doc.moveDown();
    });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }
}
