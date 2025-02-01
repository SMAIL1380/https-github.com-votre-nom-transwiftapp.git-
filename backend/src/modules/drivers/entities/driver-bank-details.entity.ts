import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Driver } from './driver.entity';

@Entity('driver_bank_details')
export class DriverBankDetails extends BaseEntity {
  @Column({ nullable: true })
  iban: string;

  @Column({ nullable: true })
  bic: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdated: Date;

  @OneToOne(() => Driver, driver => driver.bankDetails)
  @JoinColumn()
  driver: Driver;

  @Column()
  driverId: string;
}
