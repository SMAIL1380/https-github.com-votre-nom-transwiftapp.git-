import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Driver } from './driver.entity';

@Entity('external_driver_info')
export class ExternalDriverInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyName: string;

  @Column()
  kbis: string;

  @Column()
  vatNumber: string;

  @Column()
  urssafCertificate: string;

  @Column()
  cargoInsurance: string;

  @Column()
  companyBankAccount: string;

  @Column({ type: 'json', nullable: true })
  additionalDocuments: any;

  @Column({ type: 'timestamp', nullable: true })
  documentsValidatedAt: Date;

  @Column({ nullable: true })
  validatedBy: string;

  @OneToOne(() => Driver, driver => driver.externalInfo)
  driver: Driver;
}
