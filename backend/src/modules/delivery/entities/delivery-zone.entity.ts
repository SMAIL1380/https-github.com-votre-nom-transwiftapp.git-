import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ZonePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EXCLUSIVE = 'EXCLUSIVE', // Zone réservée aux véhicules internes
}

@Entity()
export class DeliveryZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb' })
  boundaries: {
    type: 'Polygon';
    coordinates: number[][][];
  };

  @Column({
    type: 'enum',
    enum: ZonePriority,
    default: ZonePriority.MEDIUM,
  })
  priority: ZonePriority;

  @Column({ type: 'jsonb' })
  restrictions: {
    timeWindows: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }[];
    vehicleTypes: string[];
    maxVehicleHeight?: number;
    maxVehicleWeight?: number;
    requiresPermit: boolean;
    environmentalZone: boolean;
  };

  @Column({ type: 'jsonb' })
  statistics: {
    averageOrdersPerDay: number;
    peakHours: {
      hour: number;
      orderCount: number;
    }[];
    averageDeliveryTime: number;
    successRate: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  demandPatterns: {
    hourly: number[];
    daily: number[];
    monthly: number[];
    seasonal: number[];
  };

  @Column({ type: 'jsonb' })
  preferences: {
    preferredVehicleTypes: string[];
    internalVehiclePriority: boolean;
    maxConcurrentVehicles?: number;
    optimalDeliveryWindows: {
      start: string;
      end: string;
      efficiency: number;
    }[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
