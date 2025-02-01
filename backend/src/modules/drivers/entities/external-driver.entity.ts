import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Driver } from './driver.entity';
import { Delivery } from './delivery.entity';
import { Vehicle } from './vehicle.entity';

@Entity()
export class ExternalDriver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Driver, driver => driver.externalProfile)
  driver: Driver;

  @Column()
  companyName: string;

  @Column()
  siretNumber: string;

  @Column()
  taxNumber: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 20.00 })
  commissionRate: number;

  @Column({ type: 'jsonb', nullable: true })
  bankDetails: {
    bankName: string;
    iban: string;
    bic: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  insuranceInfo: {
    provider: string;
    policyNumber: string;
    expiryDate: Date;
    coverage: string[];
  };

  @Column({ type: 'simple-array' })
  servicesZones: string[];

  @Column({ type: 'jsonb', default: {} })
  preferences: {
    maxDeliveriesPerDay?: number;
    preferredTimeSlots?: string[];
    excludedZones?: string[];
    vehicleTypes?: string[];
  };

  @Column({ type: 'jsonb', default: {} })
  performance: {
    averageRating: number;
    completedDeliveries: number;
    cancelledDeliveries: number;
    totalEarnings: number;
    bonusPoints: number;
  };

  @Column({ default: true })
  isAvailableForWork: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}
