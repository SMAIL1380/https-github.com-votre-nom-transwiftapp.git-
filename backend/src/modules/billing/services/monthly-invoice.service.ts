import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TransportDocument } from '../entities/transport-document.entity';
import { MonthlyInvoice } from '../entities/monthly-invoice.entity';
import { PDFService } from './pdf.service';
import { ArchiveService } from './archive.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Injectable()
export class MonthlyInvoiceService {
  constructor(
    @InjectRepository(TransportDocument)
    private documentRepo: Repository<TransportDocument>,
    @InjectRepository(MonthlyInvoice)
    private monthlyInvoiceRepo: Repository<MonthlyInvoice>,
    private pdfService: PDFService,
    private archiveService: ArchiveService,
    private notificationsService: NotificationsService,
  ) {}

  async generateMonthlyInvoices(): Promise<void> {
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const startDate = startOfMonth(previousMonth);
    const endDate = endOfMonth(previousMonth);

    // Récupérer tous les documents du mois précédent
    const documents = await this.documentRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
        isFinalized: true,
      },
      relations: ['order', 'driver', 'order.client'],
    });

    // Grouper par client
    const clientGroups = this.groupByClient(documents);

    // Générer les factures récapitulatives
    for (const [clientId, clientDocs] of Object.entries(clientGroups)) {
      await this.generateClientMonthlyInvoice(clientId, clientDocs, startDate);
    }

    // Grouper par chauffeur externe
    const driverGroups = this.groupByDriver(documents);

    // Générer les factures récapitulatives pour les chauffeurs externes
    for (const [driverId, driverDocs] of Object.entries(driverGroups)) {
      await this.generateDriverMonthlyInvoice(driverId, driverDocs, startDate);
    }
  }

  private groupByClient(documents: TransportDocument[]): Record<string, TransportDocument[]> {
    return documents.reduce((groups, doc) => {
      const clientId = doc.order.client.id;
      if (!groups[clientId]) {
        groups[clientId] = [];
      }
      groups[clientId].push(doc);
      return groups;
    }, {});
  }

  private groupByDriver(documents: TransportDocument[]): Record<string, TransportDocument[]> {
    return documents.reduce((groups, doc) => {
      if (doc.driver.isExternal) {
        const driverId = doc.driver.id;
        if (!groups[driverId]) {
          groups[driverId] = [];
        }
        groups[driverId].push(doc);
      }
      return groups;
    }, {});
  }

  private async generateClientMonthlyInvoice(
    clientId: string,
    documents: TransportDocument[],
    monthDate: Date,
  ): Promise<void> {
    const totals = this.calculateTotals(documents);
    
    const monthlyInvoice = this.monthlyInvoiceRepo.create({
      client: { id: clientId },
      month: monthDate,
      documents,
      totalTransportPrice: totals.transport,
      totalTVA: totals.tva,
      totalPrice: totals.total,
      details: this.generateInvoiceDetails(documents),
      status: 'GENERATED',
    });

    await this.monthlyInvoiceRepo.save(monthlyInvoice);

    // Générer le PDF
    const pdfBuffer = await this.pdfService.generateMonthlyInvoicePDF(monthlyInvoice);

    // Archiver le document
    await this.archiveService.archiveDocument({
      type: 'MONTHLY_INVOICE',
      reference: monthlyInvoice.id,
      date: monthDate,
      content: pdfBuffer,
      metadata: {
        clientId,
        month: format(monthDate, 'MM-yyyy'),
        documentCount: documents.length,
        totalAmount: totals.total,
      },
    });

    // Notifier le client
    await this.notificationsService.create(
      'MONTHLY_INVOICE_AVAILABLE',
      'Facture mensuelle disponible',
      `Votre facture récapitulative pour ${format(monthDate, 'MMMM yyyy', { locale: fr })} est disponible`,
      [clientId],
      {
        invoiceId: monthlyInvoice.id,
        month: format(monthDate, 'MM-yyyy'),
        totalAmount: totals.total,
      },
    );
  }

  private async generateDriverMonthlyInvoice(
    driverId: string,
    documents: TransportDocument[],
    monthDate: Date,
  ): Promise<void> {
    const totals = this.calculateDriverTotals(documents);
    
    const monthlyInvoice = this.monthlyInvoiceRepo.create({
      driver: { id: driverId },
      month: monthDate,
      documents,
      totalTransportPrice: totals.transport,
      totalCommission: totals.commission,
      totalTVA: totals.tva,
      totalPrice: totals.total,
      details: this.generateDriverInvoiceDetails(documents),
      status: 'GENERATED',
    });

    await this.monthlyInvoiceRepo.save(monthlyInvoice);

    // Générer le PDF
    const pdfBuffer = await this.pdfService.generateDriverMonthlyInvoicePDF(monthlyInvoice);

    // Archiver le document
    await this.archiveService.archiveDocument({
      type: 'DRIVER_MONTHLY_INVOICE',
      reference: monthlyInvoice.id,
      date: monthDate,
      content: pdfBuffer,
      metadata: {
        driverId,
        month: format(monthDate, 'MM-yyyy'),
        documentCount: documents.length,
        totalAmount: totals.total,
      },
    });

    // Notifier le chauffeur
    await this.notificationsService.create(
      'MONTHLY_INVOICE_AVAILABLE',
      'Récapitulatif mensuel disponible',
      `Votre récapitulatif des courses pour ${format(monthDate, 'MMMM yyyy', { locale: fr })} est disponible`,
      [driverId],
      {
        invoiceId: monthlyInvoice.id,
        month: format(monthDate, 'MM-yyyy'),
        totalAmount: totals.total,
      },
    );
  }

  private calculateTotals(documents: TransportDocument[]): {
    transport: number;
    tva: number;
    total: number;
  } {
    return documents.reduce(
      (acc, doc) => ({
        transport: acc.transport + Number(doc.transportPrice),
        tva: acc.tva + Number(doc.tva),
        total: acc.total + Number(doc.totalPrice),
      }),
      { transport: 0, tva: 0, total: 0 },
    );
  }

  private calculateDriverTotals(documents: TransportDocument[]): {
    transport: number;
    commission: number;
    tva: number;
    total: number;
  } {
    return documents.reduce(
      (acc, doc) => ({
        transport: acc.transport + Number(doc.transportPrice),
        commission: acc.commission + Number(doc.commission),
        tva: acc.tva + Number(doc.tva),
        total: acc.total + (Number(doc.transportPrice) - Number(doc.commission)),
      }),
      { transport: 0, commission: 0, tva: 0, total: 0 },
    );
  }

  private generateInvoiceDetails(documents: TransportDocument[]): any[] {
    return documents.map(doc => ({
      date: doc.createdAt,
      documentNumber: doc.documentNumber,
      pickup: doc.pickup,
      delivery: doc.delivery,
      merchandise: doc.merchandise,
      transportPrice: doc.transportPrice,
      tva: doc.tva,
      totalPrice: doc.totalPrice,
    }));
  }

  private generateDriverInvoiceDetails(documents: TransportDocument[]): any[] {
    return documents.map(doc => ({
      date: doc.createdAt,
      documentNumber: doc.documentNumber,
      pickup: doc.pickup,
      delivery: doc.delivery,
      transportPrice: doc.transportPrice,
      commission: doc.commission,
      finalPrice: Number(doc.transportPrice) - Number(doc.commission),
    }));
  }
}
