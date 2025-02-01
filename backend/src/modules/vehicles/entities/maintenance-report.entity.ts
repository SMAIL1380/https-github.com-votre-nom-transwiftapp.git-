import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { MaintenanceSchedule, MaintenanceType } from './maintenance-schedule.entity';

export enum MaintenanceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class MaintenanceReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, { eager: true })
  vehicle: Vehicle;

  @ManyToOne(() => MaintenanceSchedule, { eager: true })
  schedule: MaintenanceSchedule;

  @Column({
    type: 'enum',
    enum: MaintenanceType,
  })
  maintenanceType: MaintenanceType;

  @Column({
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.PENDING,
  })
  status: MaintenanceStatus;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date;

  @Column('integer')
  kilometersAtMaintenance: number;

  @Column({ type: 'jsonb' })
  checklistResults: {
    itemId: string;
    completed: boolean;
    notes?: string;
    images?: string[];
    partsReplaced?: {
      reference: string;
      quantity: number;
      cost: number;
    }[];
  }[];

  @Column({ type: 'jsonb' })
  costs: {
    labor: number;
    parts: number;
    additional: number;
    total: number;
    currency: string;
  };

  @Column({ type: 'text', nullable: true })
  technicianNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  anomalies: {
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    requiresImmediate: boolean;
    recommendedAction: string;
    images?: string[];
  }[];

  @Column({ type: 'text', array: true, default: [] })
  attachments: string[];

  @Column({ type: 'jsonb', nullable: true })
  nextMaintenance: {
    recommendedDate: Date;
    type: MaintenanceType;
    estimatedCost: number;
    priority: string;
  };

  @Column({ default: false })
  requiresFollowUp: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
