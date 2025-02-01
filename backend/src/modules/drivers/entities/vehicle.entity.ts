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
import { MaintenanceRecord } from './maintenance-record.entity';

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  INACTIVE = 'INACTIVE',
}

export enum VehicleType {
  VAN = 'VAN',
  TRUCK = 'TRUCK',
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
}

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  registrationNumber: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  type: VehicleType;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({ type: 'jsonb', nullable: true })
  specifications: {
    capacity: number;
    maxWeight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    fuelType: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  documents: {
    insurance: {
      provider: string;
      policyNumber: string;
      expiryDate: Date;
    };
    technicalInspection: {
      date: Date;
      expiryDate: Date;
      provider: string;
    };
    registration: {
      issueDate: Date;
      expiryDate: Date;
    };
  };

  @Column({ type: 'jsonb', default: {} })
  tracking: {
    currentLocation?: {
      latitude: number;
      longitude: number;
      lastUpdate: Date;
    };
    mileage: number;
    fuelLevel: number;
    lastRefuel: {
      date: Date;
      amount: number;
      cost: number;
    };
  };

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.ACTIVE,
  })
  status: VehicleStatus;

  @ManyToOne(() => Driver, driver => driver.assignedVehicles)
  currentDriver: Driver;

  @OneToMany(() => MaintenanceRecord, record => record.vehicle)
  maintenanceHistory: MaintenanceRecord[];

  @Column({ type: 'jsonb', default: [] })
  equipments: {
    name: string;
    status: string;
    lastCheck: Date;
  }[];

  @Column({ type: 'simple-array', nullable: true })
  restrictions: string[];

  @Column({ type: 'jsonb', default: {} })
  performance: {
    averageFuelConsumption: number;
    maintenanceCosts: number;
    incidentCount: number;
    downtime: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}
