import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

@Entity('external_driver_registrations')
export class ExternalDriverRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  licenseNumber: string;

  @Column()
  licenseExpiryDate: Date;

  @Column()
  vehicleType: string;

  @Column({ type: 'jsonb', nullable: true })
  companyInfo: {
    companyName: string;
    registrationNumber: string;
    taxIdentificationNumber: string;
    address: string;
  };

  @Column()
  insuranceNumber: string;

  @Column()
  insuranceExpiryDate: Date;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING
  })
  status: RegistrationStatus;

  @Column({ nullable: true })
  activationToken: string;

  @Column({ nullable: true })
  activationTokenExpiry: Date;

  @Column({ nullable: true })
  adminComment: string;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ nullable: true })
  reviewedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
