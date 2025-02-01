import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Driver } from './driver.entity';
import { Vehicle } from './vehicle.entity';
import { Incident } from './incident.entity';

export enum DeliveryStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum DeliveryPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Driver, driver => driver.deliveries)
  driver: Driver;

  @ManyToOne(() => Vehicle)
  vehicle: Vehicle;

  @Column()
  trackingNumber: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @Column({
    type: 'enum',
    enum: DeliveryPriority,
    default: DeliveryPriority.NORMAL,
  })
  priority: DeliveryPriority;

  @Column({ type: 'jsonb' })
  pickup: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    contactName: string;
    contactPhone: string;
    instructions?: string;
    scheduledTime: Date;
  };

  @Column({ type: 'jsonb' })
  delivery: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    contactName: string;
    contactPhone: string;
    instructions?: string;
    scheduledTime: Date;
  };

  @Column({ type: 'jsonb' })
  package: {
    type: string;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    quantity: number;
    specialHandling?: string[];
  };

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'jsonb', nullable: true })
  route: {
    distance: number;
    estimatedDuration: number;
    waypoints: {
      latitude: number;
      longitude: number;
      timestamp?: Date;
    }[];
  };

  @Column({ type: 'jsonb', default: {} })
  timing: {
    assignedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    estimatedArrival?: Date;
    actualArrival?: Date;
    delays?: {
      reason: string;
      duration: number;
    }[];
  };

  @OneToMany(() => Incident, incident => incident.delivery)
  incidents: Incident[];

  @Column({ type: 'jsonb', nullable: true })
  proof: {
    signature?: string;
    photos?: string[];
    notes?: string;
    timestamp: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  feedback: {
    rating: number;
    comment?: string;
    issues?: string[];
    timestamp: Date;
  };

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}
