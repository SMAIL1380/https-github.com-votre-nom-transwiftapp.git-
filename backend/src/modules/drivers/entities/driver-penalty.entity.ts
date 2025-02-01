import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Driver } from './driver.entity';

export enum PenaltyType {
  CANCELLATION = 'CANCELLATION',
  LATE_ARRIVAL = 'LATE_ARRIVAL',
  CUSTOMER_COMPLAINT = 'CUSTOMER_COMPLAINT',
  VEHICLE_DAMAGE = 'VEHICLE_DAMAGE',
  OTHER = 'OTHER',
}

@Entity()
export class DriverPenalty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Driver, (driver) => driver.penalties)
  driver: Driver;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PenaltyType,
    default: PenaltyType.CANCELLATION,
  })
  type: PenaltyType;

  @Column()
  reason: string;

  @Column()
  duration: number; // en heures

  @Column({ nullable: true })
  orderId?: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ type: 'jsonb', nullable: true })
  evidence?: {
    type: string;
    url: string;
    timestamp: Date;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  appeal?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reason: string;
    timestamp: Date;
    decision?: {
      by: string;
      reason: string;
      timestamp: Date;
    };
  };

  @CreateDateColumn()
  createdAt: Date;
}
