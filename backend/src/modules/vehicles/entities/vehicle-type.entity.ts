import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Vehicle } from './vehicle.entity';

export enum VehicleCategory {
  LIGHT_COMMERCIAL = 'LIGHT_COMMERCIAL',    // Véhicules utilitaires légers
  HEAVY_COMMERCIAL = 'HEAVY_COMMERCIAL',    // Poids lourds
  REFRIGERATED = 'REFRIGERATED',           // Véhicules frigorifiques
  SPECIALIZED = 'SPECIALIZED',             // Véhicules spécialisés
}

@Entity()
export class VehicleType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: VehicleCategory,
  })
  category: VehicleCategory;

  @Column('decimal', { precision: 5, scale: 2 })
  maxWeight: number; // En tonnes

  @Column('decimal', { precision: 5, scale: 2 })
  maxVolume: number; // En m3

  @Column('decimal', { precision: 5, scale: 2 })
  loadLength: number; // En mètres

  @Column('decimal', { precision: 5, scale: 2 })
  loadWidth: number; // En mètres

  @Column('decimal', { precision: 5, scale: 2 })
  loadHeight: number; // En mètres

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  specifications: {
    hasTailLift: boolean;           // Hayon élévateur
    hasRefrigeration: boolean;      // Système de réfrigération
    temperatureRange?: {            // Plage de température pour véhicules frigorifiques
      min: number;
      max: number;
    };
    hasTrackingSystem: boolean;     // Système de suivi GPS
    fuelType: string;               // Type de carburant
    emissionStandard: string;       // Norme d'émission (Euro 6, etc.)
    requiredLicense: string;        // Type de permis requis
    specialFeatures?: string[];     // Caractéristiques spéciales
  };

  @Column({ type: 'jsonb', nullable: true })
  restrictions: {
    cityAccess: boolean;            // Accès centre-ville
    timeRestrictions?: string[];    // Restrictions horaires
    zoneRestrictions?: string[];    // Restrictions de zone
    environmentalZone?: string[];   // Zones environnementales
  };

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Vehicle, vehicle => vehicle.type)
  vehicles: Vehicle[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
