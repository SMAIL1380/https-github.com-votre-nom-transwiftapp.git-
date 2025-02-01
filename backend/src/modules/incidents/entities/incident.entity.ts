import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Order } from '../../orders/entities/order.entity';
import { Driver } from '../../drivers/entities/driver.entity';

export enum IncidentType {
  DELAY = 'DELAY',
  BREAKDOWN = 'BREAKDOWN',
  ACCIDENT = 'ACCIDENT',
  TRAFFIC = 'TRAFFIC',
  WEATHER = 'WEATHER',
  CUSTOMER_ISSUE = 'CUSTOMER_ISSUE',
  DELIVERY_FAILURE = 'DELIVERY_FAILURE',
  CANCELLATION = 'CANCELLATION',
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
  UNDER_REVIEW = 'UNDER_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

@Entity()
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: IncidentType,
  })
  type: IncidentType;

  @Column({
    type: 'enum',
    enum: IncidentSeverity,
  })
  severity: IncidentSeverity;

  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.REPORTED,
  })
  status: IncidentStatus;

  @Column()
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };

  @ManyToOne(() => Vehicle, { nullable: true })
  vehicle?: Vehicle;

  @ManyToOne(() => Order, { nullable: true })
  order?: Order;

  @ManyToOne(() => Driver, { nullable: true })
  driver?: Driver;

  @Column({ type: 'jsonb' })
  impact: {
    estimatedDelay: number; // en minutes
    affectedOrders: string[];
    customerNotified: boolean;
    financialImpact?: number;
  };

  @Column({ type: 'jsonb' })
  resolution: {
    assignedTo?: string;
    priority: number;
    steps: {
      action: string;
      status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
      timestamp?: Date;
    }[];
    alternativeSolutions?: string[];
    selectedSolution?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  customerCommunication: {
    notificationsSent: {
      timestamp: Date;
      type: string;
      content: string;
    }[];
    customerResponses?: {
      timestamp: Date;
      content: string;
    }[];
    satisfactionRating?: number;
  };

  @Column({ type: 'jsonb' })
  timeline: {
    reported: Date;
    acknowledged?: Date;
    resolutionStarted?: Date;
    resolved?: Date;
    closed?: Date;
  };

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
