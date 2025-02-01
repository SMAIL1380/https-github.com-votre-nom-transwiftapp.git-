import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Driver } from './driver.entity';

@Entity('driver_reviews')
export class DriverReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  deliveryId: string;

  @Column({ type: 'float' })
  rating: number;

  @Column({ nullable: true })
  comment: string;

  @Column({ default: false })
  isReported: boolean;

  @Column({ nullable: true })
  reportReason: string;

  @ManyToOne(() => Driver, driver => driver.reviews)
  driver: Driver;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
