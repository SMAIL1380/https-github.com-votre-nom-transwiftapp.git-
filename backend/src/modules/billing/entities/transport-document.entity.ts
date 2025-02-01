import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Driver } from '../../drivers/entities/driver.entity';

export enum DocumentType {
  FACTURE = 'FACTURE',
  LETTRE_VOITURE = 'LETTRE_VOITURE',
  BON_LIVRAISON = 'BON_LIVRAISON',
  RECU = 'RECU',
}

@Entity()
export class TransportDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentNumber: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  type: DocumentType;

  @ManyToOne(() => Order)
  order: Order;

  @Column({ type: 'jsonb' })
  shipper: {
    name: string;
    address: string;
    phone: string;
    email: string;
    siret?: string;
    tva?: string;
  };

  @Column({ type: 'jsonb' })
  receiver: {
    name: string;
    address: string;
    phone: string;
    email: string;
    siret?: string;
    tva?: string;
  };

  @Column({ type: 'jsonb' })
  merchandise: {
    description: string;
    quantity: number;
    weight: number;
    volume: number;
    value?: number;
    dangerous?: boolean;
    dangerousClass?: string;
    specialInstructions?: string;
  };

  @Column({ type: 'jsonb' })
  pickup: {
    address: string;
    date: Date;
    instructions?: string;
    contactPerson: string;
    contactPhone: string;
  };

  @Column({ type: 'jsonb' })
  delivery: {
    address: string;
    date: Date;
    instructions?: string;
    contactPerson: string;
    contactPhone: string;
  };

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  transportPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commission: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tva: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @ManyToOne(() => Driver)
  driver: Driver;

  @Column({ type: 'jsonb', nullable: true })
  signatures?: {
    shipper?: {
      name: string;
      signature: string;
      date: Date;
    };
    driver?: {
      name: string;
      signature: string;
      date: Date;
    };
    receiver?: {
      name: string;
      signature: string;
      date: Date;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  additionalInfo?: {
    insurance?: {
      provider: string;
      policyNumber: string;
      coverage: number;
    };
    customs?: {
      declarationNumber: string;
      documents: string[];
    };
    temperature?: {
      required: number;
      min: number;
      max: number;
    };
  };

  @Column({ default: false })
  isFinalized: boolean;

  @Column({ nullable: true })
  finalizedAt?: Date;

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  cancelReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
