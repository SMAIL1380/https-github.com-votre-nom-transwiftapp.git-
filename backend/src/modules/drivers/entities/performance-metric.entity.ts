import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Driver } from './driver.entity';

export enum MetricType {
  DELIVERY_TIME = 'DELIVERY_TIME',
  CUSTOMER_RATING = 'CUSTOMER_RATING',
  COMPLETION_RATE = 'COMPLETION_RATE',
  PUNCTUALITY = 'PUNCTUALITY',
  PROFESSIONALISM = 'PROFESSIONALISM',
  VEHICLE_CONDITION = 'VEHICLE_CONDITION',
  DOCUMENTATION = 'DOCUMENTATION',
  SAFETY_SCORE = 'SAFETY_SCORE',
}

export enum MetricPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

@Entity()
export class PerformanceMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Driver, { eager: true })
  driver: Driver;

  @Column({
    type: 'enum',
    enum: MetricType,
  })
  metricType: MetricType;

  @Column({
    type: 'enum',
    enum: MetricPeriod,
  })
  period: MetricPeriod;

  @Column('decimal', { precision: 5, scale: 2 })
  value: number;

  @Column('decimal', { precision: 5, scale: 2 })
  target: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  details: {
    totalDeliveries?: number;
    completedDeliveries?: number;
    totalRatings?: number;
    averageRating?: number;
    onTimeDeliveries?: number;
    lateDeliveries?: number;
    incidentReports?: number;
    documentationScore?: number;
    safetyIncidents?: number;
    customerComplaints?: number;
    customerCompliments?: number;
  };

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ default: false })
  isReviewed: boolean;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
