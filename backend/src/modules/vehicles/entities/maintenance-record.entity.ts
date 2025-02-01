import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Vehicle } from './vehicle.entity';

export enum MaintenanceType {
  ROUTINE = 'routine',
  REPAIR = 'repair',
  INSPECTION = 'inspection',
  EMERGENCY = 'emergency',
}

@Entity()
export class MaintenanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, vehicle => vehicle.maintenanceRecords)
  vehicle: Vehicle;

  @Column({
    type: 'enum',
    enum: MaintenanceType,
  })
  type: MaintenanceType;

  @Column()
  description: string;

  @Column({ type: 'float' })
  cost: number;

  @Column()
  serviceProvider: string;

  @Column({ type: 'float' })
  mileageAtService: number;

  @Column()
  date: Date;

  @Column({ nullable: true })
  nextServiceDate: Date;

  @Column({ default: false })
  isResolved: boolean;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  partsReplaced: {
    name: string;
    cost: number;
    warranty?: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;
}
