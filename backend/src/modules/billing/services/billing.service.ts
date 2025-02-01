import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransportDocument, DocumentType } from '../entities/transport-document.entity';
import { Order } from '../../orders/entities/order.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { PDFService } from './pdf.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BillingService {
  private readonly COMMISSION_RATE = 0.20; // 20% commission
  private readonly TVA_RATE = 0.20; // 20% TVA

  constructor(
    @InjectRepository(TransportDocument)
    private documentRepo: Repository<TransportDocument>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Driver)
    private driverRepo: Repository<Driver>,
    private pdfService: PDFService,
    private configService: ConfigService,
  ) {}

  async generateTransportDocuments(orderId: string): Promise<void> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['driver', 'client', 'pickup', 'delivery'],
    });

    if (!order) {
      throw new Error('Commande non trouvée');
    }

    // Calculer les prix
    const prices = await this.calculatePrices(order);

    // Créer la facture
    const invoice = await this.createDocument(
      order,
      DocumentType.FACTURE,
      prices,
    );

    // Créer la lettre de voiture
    const waybill = await this.createDocument(
      order,
      DocumentType.LETTRE_VOITURE,
      prices,
    );

    // Créer le bon de livraison
    const deliveryNote = await this.createDocument(
      order,
      DocumentType.BON_LIVRAISON,
      prices,
    );

    // Générer les PDFs
    await Promise.all([
      this.pdfService.generatePDF(invoice),
      this.pdfService.generatePDF(waybill),
      this.pdfService.generatePDF(deliveryNote),
    ]);
  }

  private async calculatePrices(order: Order): Promise<{
    basePrice: number;
    commission: number;
    tva: number;
    total: number;
  }> {
    const basePrice = order.price;
    const commission = order.driver.isExternal ? basePrice * this.COMMISSION_RATE : 0;
    const priceBeforeTVA = basePrice + commission;
    const tva = priceBeforeTVA * this.TVA_RATE;
    const total = priceBeforeTVA + tva;

    return {
      basePrice,
      commission,
      tva,
      total,
    };
  }

  private async createDocument(
    order: Order,
    type: DocumentType,
    prices: {
      basePrice: number;
      commission: number;
      tva: number;
      total: number;
    },
  ): Promise<TransportDocument> {
    const document = this.documentRepo.create({
      type,
      documentNumber: await this.generateDocumentNumber(type),
      order,
      driver: order.driver,
      shipper: {
        name: order.pickup.contactName,
        address: order.pickup.address,
        phone: order.pickup.phone,
        email: order.pickup.email,
        siret: order.pickup.siret,
        tva: order.pickup.tva,
      },
      receiver: {
        name: order.delivery.contactName,
        address: order.delivery.address,
        phone: order.delivery.phone,
        email: order.delivery.email,
        siret: order.delivery.siret,
        tva: order.delivery.tva,
      },
      merchandise: {
        description: order.merchandise.description,
        quantity: order.merchandise.quantity,
        weight: order.merchandise.weight,
        volume: order.merchandise.volume,
        value: order.merchandise.value,
        dangerous: order.merchandise.dangerous,
        dangerousClass: order.merchandise.dangerousClass,
        specialInstructions: order.merchandise.specialInstructions,
      },
      pickup: {
        address: order.pickup.address,
        date: order.pickup.scheduledTime,
        instructions: order.pickup.instructions,
        contactPerson: order.pickup.contactName,
        contactPhone: order.pickup.phone,
      },
      delivery: {
        address: order.delivery.address,
        date: order.delivery.scheduledTime,
        instructions: order.delivery.instructions,
        contactPerson: order.delivery.contactName,
        contactPhone: order.delivery.phone,
      },
      transportPrice: prices.basePrice,
      commission: prices.commission,
      tva: prices.tva,
      totalPrice: prices.total,
    });

    return this.documentRepo.save(document);
  }

  private async generateDocumentNumber(type: DocumentType): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const count = await this.documentRepo.count({
      where: {
        type,
        createdAt: Between(
          new Date(date.getFullYear(), date.getMonth(), 1),
          new Date(date.getFullYear(), date.getMonth() + 1, 0),
        ),
      },
    });

    const prefix = {
      [DocumentType.FACTURE]: 'FAC',
      [DocumentType.LETTRE_VOITURE]: 'LDV',
      [DocumentType.BON_LIVRAISON]: 'BDL',
      [DocumentType.RECU]: 'REC',
    }[type];

    return `${prefix}-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  async getDriverPrice(orderId: string, driverId: string): Promise<number | null> {
    const driver = await this.driverRepo.findOne({
      where: { id: driverId },
    });

    if (!driver) {
      throw new Error('Chauffeur non trouvé');
    }

    // Ne montrer le prix qu'aux chauffeurs externes
    if (!driver.isExternal) {
      return null;
    }

    const order = await this.orderRepo.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Commande non trouvée');
    }

    // Calculer le prix après commission
    return order.price * (1 - this.COMMISSION_RATE);
  }

  async finalizeDocument(documentId: string, signatures: any): Promise<void> {
    const document = await this.documentRepo.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Document non trouvé');
    }

    document.signatures = signatures;
    document.isFinalized = true;
    document.finalizedAt = new Date();

    await this.documentRepo.save(document);
    await this.pdfService.generatePDF(document);
  }
}
