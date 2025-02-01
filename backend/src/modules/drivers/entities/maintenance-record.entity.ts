import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';

export enum MaintenanceType {
  ROUTINE = 'ROUTINE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
  UPGRADE = 'UPGRADE',
  EMERGENCY = 'EMERGENCY',
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class MaintenanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, vehicle => vehicle.maintenanceHistory)
  vehicle: Vehicle;

  @Column({
    type: 'enum',
    enum: MaintenanceType,
  })
  type: MaintenanceType;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.SCHEDULED,
  })
  status: MaintenanceStatus;

  @Column()
  scheduledDate: Date;

  @Column({ nullable: true })
  completedDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  mileage: number;

  @Column({ type: 'jsonb', nullable: true })
  service: {
    provider: string;
    location: string;
    technician?: string;
    contactInfo?: {
      phone: string;
      email: string;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  parts: {
    name: string;
    quantity: number;
    cost: number;
    partNumber?: string;
    warranty?: {
      period: number;
      expiryDate: Date;
    };
  }[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  laborCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  partsCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number;

  @Column({ type: 'jsonb', nullable: true })
  diagnosis: {
    issues: string[];
    recommendations: string[];
    urgency: string;
  };

  @Column({ type: 'simple-array', nullable: true })
  tasksPerformed: string[];

  @Column({ type: 'jsonb', nullable: true })
  quality: {
    inspectedBy: string;
    inspectionDate: Date;
    rating: number;
    notes?: string;
  };

  @Column({ type: 'jsonb', default: [] })
  attachments: {
    type: string;
    url: string;
    description?: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  warranty: {
    provider: string;
    coverageDetails: string;
    startDate: Date;
    endDate: Date;
    claimHistory?: {
      date: Date;
      description: string;
      status: string;
    }[];
  };

  @Column({ type: 'jsonb', default: [] })
  followUp: {
    date: Date;
    type: string;
    notes: string;
    status: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}
