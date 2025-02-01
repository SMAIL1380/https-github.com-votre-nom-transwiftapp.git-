import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Admin } from '../../admin/entities/admin.entity';

@Entity()
export class AlertSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Admin, { eager: true })
  admin: Admin;

  @Column({ default: true })
  inAppNotifications: boolean;

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: true })
  alertDocumentExpiring: boolean;

  @Column({ default: 30 })
  documentExpiringDays: number;

  @Column({ default: true })
  alertDocumentExpired: boolean;

  @Column({ default: true })
  alertVerificationFailed: boolean;

  @Column({ default: true })
  alertLowComplianceRate: boolean;

  @Column({ default: 80 })
  lowComplianceThreshold: number;

  @Column({ default: true })
  alertNewRegistration: boolean;

  @Column({ type: 'json', nullable: true })
  customAlerts: {
    type: string;
    enabled: boolean;
    threshold?: number;
    message?: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
