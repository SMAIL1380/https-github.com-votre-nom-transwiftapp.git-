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
import { Vehicle } from './vehicle.entity';

@Entity()
export class InternalDriver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Driver, driver => driver.internalProfile)
  driver: Driver;

  @Column()
  employeeId: string;

  @Column()
  contractType: string;

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  endDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseSalary: number;

  @Column({ type: 'jsonb', nullable: true })
  benefits: {
    healthInsurance?: boolean;
    retirementPlan?: boolean;
    mealVouchers?: boolean;
    transportAllowance?: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  schedule: {
    workDays: string[];
    shiftHours: {
      start: string;
      end: string;
    };
    breakTime: number;
  };

  @Column({ type: 'jsonb', default: {} })
  performance: {
    averageRating: number;
    completedDeliveries: number;
    punctualityRate: number;
    customerFeedback: {
      positive: number;
      negative: number;
    };
    bonuses: number;
  };

  @Column({ type: 'simple-array' })
  qualifications: string[];

  @Column({ type: 'jsonb', nullable: true })
  trainingHistory: {
    date: Date;
    type: string;
    description: string;
    status: string;
    validUntil?: Date;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    address: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}
