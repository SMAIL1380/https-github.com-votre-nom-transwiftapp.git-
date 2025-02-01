import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Driver } from './driver.entity';

export enum TaskType {
  DOCUMENT_UPDATE = 'DOCUMENT_UPDATE',         // Mise à jour des documents
  VEHICLE_INSPECTION = 'VEHICLE_INSPECTION',   // Inspection du véhicule
  TRAINING = 'TRAINING',                       // Formation
  MAINTENANCE = 'MAINTENANCE',                 // Maintenance programmée
  MEETING = 'MEETING',                         // Réunion
  EVALUATION = 'EVALUATION',                   // Évaluation de performance
  MEDICAL_CHECKUP = 'MEDICAL_CHECKUP',        // Visite médicale
  LICENSE_RENEWAL = 'LICENSE_RENEWAL',         // Renouvellement de permis
  INSURANCE_RENEWAL = 'INSURANCE_RENEWAL',     // Renouvellement d'assurance
  OTHER = 'OTHER',                            // Autre
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  PENDING = 'PENDING',           // En attente
  IN_PROGRESS = 'IN_PROGRESS',   // En cours
  COMPLETED = 'COMPLETED',       // Terminée
  OVERDUE = 'OVERDUE',          // En retard
  CANCELLED = 'CANCELLED',       // Annulée
}

@Entity()
export class DriverTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Driver, driver => driver.tasks)
  @JoinColumn()
  driver: Driver;

  @Column({
    type: 'enum',
    enum: TaskType,
  })
  type: TaskType;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  completedDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  requirements?: {
    documents?: string[];
    location?: string;
    equipment?: string[];
    prerequisites?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  notification?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    reminderDays?: number[];
  };

  @Column({ type: 'jsonb', nullable: true })
  completion?: {
    completedBy?: string;
    notes?: string;
    attachments?: string[];
    score?: number;
    feedback?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval: number;
    endDate?: Date;
    count?: number;
  };

  @Column({ nullable: true })
  parentTaskId?: string;

  @Column({ type: 'simple-array', nullable: true })
  dependencies?: string[];

  @Column({ default: false })
  isBlocking: boolean;

  @Column({ default: false })
  requiresValidation: boolean;

  @Column({ type: 'simple-array', nullable: true })
  validators?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}
