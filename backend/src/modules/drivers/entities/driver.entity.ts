import { Entity, Column, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Delivery } from '../../delivery/entities/delivery.entity';
import { DriverBankDetails } from './driver-bank-details.entity';
import { Point } from 'geojson';

export enum DriverType {
  INTERNAL = 'internal',    // Chauffeur salarié
  EXTERNAL = 'external'     // Chauffeur sous-traitant
}

export enum DriverStatus {
  OFFLINE = 'offline',
  ONLINE = 'online',
  ON_DELIVERY = 'on_delivery',
  ON_BREAK = 'on_break',
  INACTIVE = 'inactive'
}

@Entity('drivers')
export class Driver extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({
    type: 'enum',
    enum: DriverType,
    default: DriverType.EXTERNAL
  })
  driverType: DriverType;

  @Column({
    type: 'enum',
    enum: DriverStatus,
    default: DriverStatus.OFFLINE
  })
  status: DriverStatus;

  // Informations spécifiques aux chauffeurs internes (salariés)
  @Column({ nullable: true })
  employeeId?: string;

  @Column({ nullable: true })
  socialSecurityNumber?: string;

  @Column({ type: 'timestamp', nullable: true })
  contractStartDate?: Date;

  @Column({ nullable: true })
  contractType?: string;

  // Informations de localisation
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true
  })
  currentLocation: Point;

  @Column({ type: 'timestamp', nullable: true })
  lastLocationUpdate: Date;

  @Column({ type: 'jsonb', nullable: true })
  workingArea: {
    center: [number, number];
    radius: number;
  };

  // Documents et vérifications
  @Column({ default: false })
  documentsVerified: boolean;

  @Column({ default: false })
  bankDetailsVerified: boolean;

  @Column({ type: 'jsonb', nullable: true })
  documents: {
    drivingLicense?: {
      number: string;
      expiryDate: Date;
      verified: boolean;
      documentUrl: string;
    };
    idCard?: {
      number: string;
      expiryDate: Date;
      verified: boolean;
      documentUrl: string;
    };
    insurance?: {
      number: string;
      expiryDate: Date;
      verified: boolean;
      documentUrl: string;
    };
    vehicleRegistration?: {
      number: string;
      expiryDate: Date;
      verified: boolean;
      documentUrl: string;
    };
  };

  // Véhicule
  @Column({ type: 'jsonb', nullable: true })
  vehicle: {
    type: string;
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
    capacity: number;
  };

  // Statistiques et performances
  @Column({ type: 'jsonb', default: {} })
  statistics: {
    totalDeliveries: number;
    completedDeliveries: number;
    cancelledDeliveries: number;
    totalEarnings: number;
    averageRating: number;
    onTimeDeliveryRate: number;
    totalDistance: number;
    totalWorkingHours: number;
  };

  // Préférences de travail
  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    workingHours: {
      monday: { start: string; end: string }[];
      tuesday: { start: string; end: string }[];
      wednesday: { start: string; end: string }[];
      thursday: { start: string; end: string }[];
      friday: { start: string; end: string }[];
      saturday: { start: string; end: string }[];
      sunday: { start: string; end: string }[];
    };
    maxDeliveriesPerDay: number;
    preferredAreas: string[];
    vehicleTypes: string[];
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };

  // Relations
  @OneToMany(() => Delivery, delivery => delivery.driver)
  deliveries: Delivery[];

  @OneToOne(() => DriverBankDetails, bankDetails => bankDetails.driver)
  bankDetails: DriverBankDetails;

  // Méthodes utilitaires
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isAvailable(): boolean {
    return this.status === DriverStatus.ONLINE;
  }

  get isInternal(): boolean {
    return this.driverType === DriverType.INTERNAL;
  }

  get isExternal(): boolean {
    return this.driverType === DriverType.EXTERNAL;
  }
}
