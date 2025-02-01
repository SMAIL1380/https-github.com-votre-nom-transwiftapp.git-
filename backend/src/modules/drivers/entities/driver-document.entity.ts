import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Driver } from './driver.entity';

@Entity('driver_documents')
export class DriverDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // license, insurance, identity, etc.

  @Column()
  documentNumber: string;

  @Column()
  documentUrl: string;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @ManyToOne(() => Driver, driver => driver.documents)
  driver: Driver;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
