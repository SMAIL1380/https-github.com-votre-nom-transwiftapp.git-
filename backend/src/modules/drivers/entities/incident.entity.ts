import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Driver } from './driver.entity';
import { Delivery } from './delivery.entity';
import { Vehicle } from './vehicle.entity';

export enum IncidentType {
  DELAY = 'DELAY',
  ACCIDENT = 'ACCIDENT',
  VEHICLE_BREAKDOWN = 'VEHICLE_BREAKDOWN',
  PACKAGE_DAMAGE = 'PACKAGE_DAMAGE',
  DELIVERY_REFUSAL = 'DELIVERY_REFUSAL',
  SECURITY_ISSUE = 'SECURITY_ISSUE',
  OTHER = 'OTHER',
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
  REPORTED = 'REPORTED',
  INVESTIGATING = 'INVESTIGATING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

@Entity()
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Driver, driver => driver.incidents)
  driver: Driver;

  @ManyToOne(() => Delivery, delivery => delivery.incidents)
  delivery?: Delivery;

  @ManyToOne(() => Vehicle)
  vehicle?: Vehicle;

  @Column({
    type: 'enum',
    enum: IncidentType,
  })
  type: IncidentType;

  @Column({
    type: 'enum',
    enum: IncidentSeverity,
    default: IncidentSeverity.MEDIUM,
  })
  severity: IncidentSeverity;

  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.REPORTED,
  })
  status: IncidentStatus;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  location: {
    address?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };

  @Column({ type: 'simple-array', nullable: true })
  involvedParties?: string[];

  @Column({ type: 'jsonb', nullable: true })
  evidence: {
    photos?: string[];
    videos?: string[];
    documents?: string[];
    witnesses?: {
      name: string;
      contact: string;
      statement: string;
    }[];
  };

  @Column({ type: 'jsonb', default: {} })
  timeline: {
    reportedAt: Date;
    updatedAt?: Date;
    resolvedAt?: Date;
    closedAt?: Date;
    events: {
      timestamp: Date;
      action: string;
      description: string;
      user: string;
    }[];
  };

  @Column({ type: 'jsonb', nullable: true })
  resolution: {
    action: string;
    cost?: number;
    responsibleParty?: string;
    insuranceClaim?: {
      number: string;
      status: string;
      amount: number;
    };
    preventiveMeasures?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  impact: {
    deliveryDelay?: number;
    financialLoss?: number;
    customerImpact?: string;
    reputationalDamage?: string;
  };

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  assignedTo?: string;

  @Column({ type: 'simple-array', nullable: true })
  notifyList?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}
