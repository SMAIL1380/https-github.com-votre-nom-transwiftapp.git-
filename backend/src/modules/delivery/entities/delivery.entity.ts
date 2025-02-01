import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { Client } from '../../clients/entities/client.entity';
import { DeliveryStatus } from '../enums/delivery-status.enum';
import { Point } from 'geojson';

@Entity('deliveries')
export class Delivery extends BaseEntity {
  @ManyToOne(() => Driver, driver => driver.deliveries)
  @JoinColumn()
  driver: Driver;

  @Column({ nullable: true })
  driverId: string;

  @ManyToOne(() => Client, client => client.deliveries)
  @JoinColumn()
  client: Client;

  @Column()
  clientId: string;

  @Column()
  pickupAddress: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326
  })
  pickupLocation: Point;

  @Column()
  deliveryAddress: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326
  })
  deliveryLocation: Point;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING
  })
  status: DeliveryStatus;

  @Column({ type: 'timestamp' })
  pickupTime: Date;

  @Column({ type: 'timestamp' })
  expectedDeliveryTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  pickedUpAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  distance: number;

  @Column({ type: 'jsonb' })
  packageDetails: {
    weight: number;
    dimensions: string;
    type: string;
    specialInstructions?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  deliveryProof: {
    signature?: string;
    photo?: string;
    note?: string;
    timestamp?: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  route: {
    coordinates: [number, number][];
    estimatedDuration: number;
    estimatedDistance: number;
  };

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  currentLocation: Point;

  @Column({ type: 'timestamp', nullable: true })
  lastLocationUpdate: Date;

  // Statistiques de livraison
  @Column({ type: 'int', default: 0 })
  delayMinutes: number;

  @Column({ default: false })
  isLate: boolean;

  @Column({ default: false })
  hasIssue: boolean;

  @Column({ type: 'text', nullable: true })
  issueDescription: string;

  // Relations pour le suivi des modifications
  @Column({ nullable: true })
  lastModifiedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  lastModifiedAt: Date;
}
