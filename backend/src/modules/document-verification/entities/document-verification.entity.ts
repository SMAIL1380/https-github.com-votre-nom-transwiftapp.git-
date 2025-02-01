import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Driver } from '../../drivers/entities/driver.entity';

export enum DocumentType {
  KBIS = 'KBIS',
  VAT_CERTIFICATE = 'VAT_CERTIFICATE',
  URSSAF_CERTIFICATE = 'URSSAF_CERTIFICATE',
  CARGO_INSURANCE = 'CARGO_INSURANCE',
  VEHICLE_INSURANCE = 'VEHICLE_INSURANCE',
  VEHICLE_REGISTRATION = 'VEHICLE_REGISTRATION',
  DRIVER_LICENSE = 'DRIVER_LICENSE',
  BANK_DETAILS = 'BANK_DETAILS',
  IDENTITY_DOCUMENT = 'IDENTITY_DOCUMENT',
  PROFESSIONAL_CARD = 'PROFESSIONAL_CARD',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

@Entity('document_verifications')
export class DocumentVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column()
  documentNumber: string;

  @Column()
  documentUrl: string;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Column({ type: 'timestamp' })
  issueDate: Date;

  @Column({ type: 'timestamp' })
  expiryDate: Date;

  @Column({ type: 'json', nullable: true })
  verificationDetails: {
    verifiedBy?: string;
    verificationDate?: Date;
    verificationMethod?: string;
    verificationResult?: string;
    rejectionReason?: string;
    apiResponse?: any;
  };

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @ManyToOne(() => Driver, driver => driver.documents)
  driver: Driver;

  @Column({ default: false })
  isAutoVerified: boolean;

  @Column({ nullable: true })
  lastVerificationAttempt: Date;

  @Column({ default: 0 })
  verificationAttempts: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
