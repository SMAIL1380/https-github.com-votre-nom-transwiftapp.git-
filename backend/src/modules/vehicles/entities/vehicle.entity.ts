import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Driver } from '../../drivers/entities/driver.entity';
import { Delivery } from '../../delivery/entities/delivery.entity';
import { MaintenanceRecord } from './maintenance-record.entity';

export enum VehicleType {
  CAR = 'car',
  VAN = 'van',
  TRUCK = 'truck',
  MOTORCYCLE = 'motorcycle',
}

export enum VehicleStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
}

export enum FuelType {
  GASOLINE = 'gasoline',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
}

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  registrationNumber: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  type: VehicleType;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
  })
  status: VehicleStatus;

  @Column({
    type: 'enum',
    enum: FuelType,
  })
  fuelType: FuelType;

  @Column({ type: 'float' })
  fuelCapacity: number;

  @Column({ type: 'float', default: 0 })
  currentFuelLevel: number;

  @Column({ type: 'float', default: 0 })
  mileage: number;

  @Column({ type: 'float' })
  maxLoadWeight: number;

  @Column({ type: 'json', nullable: true })
  dimensions: {
    length: number;
    width: number;
    height: number;
  };

  @Column({ nullable: true })
  lastMaintenanceDate: Date;

  @Column({ nullable: true })
  nextMaintenanceDate: Date;

  @Column({ type: 'float', default: 0 })
  totalDeliveries: number;

  @Column({ type: 'float', default: 0 })
  totalDistance: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => Driver, { nullable: true })
  currentDriver: Driver;

  @OneToMany(() => MaintenanceRecord, record => record.vehicle)
  maintenanceRecords: MaintenanceRecord[];

  @OneToMany(() => Delivery, delivery => delivery.vehicle)
  deliveries: Delivery[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
