import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Driver } from './driver.entity';
import { Vehicle } from './vehicle.entity';

export enum DocumentType {
  DRIVER_LICENSE = 'DRIVER_LICENSE',
  IDENTITY_CARD = 'IDENTITY_CARD',
  INSURANCE = 'INSURANCE',
  VEHICLE_REGISTRATION = 'VEHICLE_REGISTRATION',
  TECHNICAL_INSPECTION = 'TECHNICAL_INSPECTION',
  WORK_CONTRACT = 'WORK_CONTRACT',
  TRAINING_CERTIFICATE = 'TRAINING_CERTIFICATE',
  DELIVERY_NOTE = 'DELIVERY_NOTE',
  INVOICE = 'INVOICE',
  INCIDENT_REPORT = 'INCIDENT_REPORT',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  VALID = 'VALID',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
}

@Entity()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Driver, driver => driver.documents)
  driver?: Driver;

  @ManyToOne(() => Vehicle)
  vehicle?: Vehicle;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  type: DocumentType;

  @Column()
  number: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column()
  fileUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    fileSize: number;
    fileType: string;
    pages?: number;
    hash?: string;
    originalName: string;
  };

  @Column()
  issueDate: Date;

  @Column()
  expiryDate: Date;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column({ type: 'jsonb', nullable: true })
  verification: {
    verifiedBy?: string;
    verifiedAt?: Date;
    comments?: string;
    rejectionReason?: string;
  };

  @Column({ type: 'jsonb', default: {} })
  reminders: {
    enabled: boolean;
    daysBeforeExpiry: number[];
    lastReminder?: Date;
    nextReminder?: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  archive: {
    archiveDate?: Date;
    retentionPeriod: number;
    deleteAfter: Date;
    archiveLocation?: string;
  };

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', default: [] })
  history: {
    action: string;
    timestamp: Date;
    user: string;
    details?: string;
  }[];

  @Column({ default: false })
  isPublic: boolean;

  @Column({ type: 'simple-array', nullable: true })
  sharedWith?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}
