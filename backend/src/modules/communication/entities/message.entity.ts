import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Conversation } from './conversation.entity';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  LOCATION = 'LOCATION',
  SYSTEM = 'SYSTEM',
  VOICE = 'VOICE',
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export enum MessagePriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conversation, conversation => conversation.messages)
  conversation: Conversation;

  @ManyToOne(() => User, user => user.sentMessages)
  sender: User;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column('text')
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    thumbnail?: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  };

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Column({
    type: 'enum',
    enum: MessagePriority,
    default: MessagePriority.NORMAL,
  })
  priority: MessagePriority;

  @Column({ type: 'jsonb', nullable: true })
  delivery?: {
    deliveredAt?: Date;
    readAt?: Date;
    deliveredTo?: string[];
    readBy?: string[];
  };

  @Column({ default: false })
  isEdited: boolean;

  @Column({ nullable: true })
  editedAt?: Date;

  @Column({ nullable: true })
  replyToId?: string;

  @Column({ type: 'simple-array', nullable: true })
  mentions?: string[];

  @Column({ default: false })
  isForwarded: boolean;

  @Column({ default: false })
  isSystemMessage: boolean;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ type: 'simple-array', nullable: true })
  reactions?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}
