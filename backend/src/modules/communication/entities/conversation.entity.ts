import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';

export enum ConversationType {
  DIRECT = 'DIRECT',           // Conversation entre deux utilisateurs
  GROUP = 'GROUP',             // Groupe de discussion
  ANNOUNCEMENT = 'ANNOUNCEMENT', // Annonces officielles
  SUPPORT = 'SUPPORT',         // Canal de support
  BROADCAST = 'BROADCAST',     // Messages diffusés à tous
}

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.DIRECT,
  })
  type: ConversationType;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  avatar?: string;

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[];

  @ManyToMany(() => User)
  @JoinTable()
  admins: User[];

  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];

  @Column({ type: 'jsonb', nullable: true })
  settings?: {
    isReadOnly?: boolean;
    canParticipantsInvite?: boolean;
    canParticipantsLeave?: boolean;
    isAnonymous?: boolean;
    retentionDays?: number;
    autoDeleteMessages?: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    category?: string;
    tags?: string[];
    priority?: string;
    customFields?: Record<string, any>;
  };

  @Column({ default: false })
  isArchived: boolean;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ type: 'simple-array', nullable: true })
  pinnedMessageIds?: string[];

  @Column({ default: false })
  isMuted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastMessageAt?: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}
