import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  READ = 'read',
  DELETED = 'deleted'
}

export enum NotificationType {
  DELIVERY = 'delivery',
  MAINTENANCE = 'maintenance',
  FUEL = 'fuel',
  MESSAGE = 'message',
  SYSTEM = 'system',
  ALERT = 'alert'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('notifications')
@Index(['userId', 'status'])
@Index(['type', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL
  })
  priority: NotificationPriority;

  @Column()
  title: string;

  @Column('text')
  body: string;

  @Column('jsonb', { nullable: true })
  data: any;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING
  })
  status: NotificationStatus;

  @Column({ default: false })
  read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledFor: Date;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastRetryAt: Date;

  @Column({ nullable: true })
  error: string;

  @Column('text', { array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  actions: {
    id: string;
    title: string;
    type: string;
    payload?: any;
  }[];

  @Column({ nullable: true })
  groupId: string;

  @Column({ type: 'int', nullable: true })
  groupOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
