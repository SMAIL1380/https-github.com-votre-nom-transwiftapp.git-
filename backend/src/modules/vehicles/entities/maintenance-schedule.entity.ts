import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { VehicleType } from './vehicle-type.entity';

export enum MaintenanceType {
  ROUTINE = 'ROUTINE',           // Entretien régulier
  TECHNICAL = 'TECHNICAL',       // Contrôle technique
  SAFETY = 'SAFETY',            // Contrôle sécurité
  REFRIGERATION = 'REFRIGERATION', // Système frigorifique
  SPECIALIZED = 'SPECIALIZED',   // Équipements spécialisés
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity()
export class MaintenanceSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => VehicleType, { eager: true })
  vehicleType: VehicleType;

  @Column({
    type: 'enum',
    enum: MaintenanceType,
  })
  maintenanceType: MaintenanceType;

  @Column({
    type: 'enum',
    enum: MaintenancePriority,
    default: MaintenancePriority.MEDIUM,
  })
  priority: MaintenancePriority;

  @Column('integer')
  frequencyDays: number; // Fréquence en jours

  @Column('integer')
  frequencyKm: number; // Fréquence en kilomètres

  @Column({ type: 'jsonb' })
  checklistItems: {
    id: string;
    description: string;
    required: boolean;
    estimatedDuration: number; // En minutes
    specialistRequired: boolean;
    tools?: string[];
    parts?: {
      reference: string;
      name: string;
      quantity: number;
    }[];
  }[];

  @Column({ type: 'jsonb' })
  alertSettings: {
    kmBeforeAlert: number;
    daysBeforeAlert: number;
    notifyRoles: string[];
    escalationThreshold: number; // Jours après la date prévue
    autoSchedule: boolean;
  };

  @Column({ type: 'text', array: true, default: [] })
  requiredCertifications: string[];

  @Column({ type: 'jsonb', nullable: true })
  estimatedCosts: {
    labor: number;
    parts: number;
    additional: number;
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
