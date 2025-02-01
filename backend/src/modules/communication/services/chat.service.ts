import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageType, MessageStatus } from '../entities/message.entity';
import { Conversation, ConversationType } from '../entities/conversation.entity';
import { User } from '../../users/entities/user.entity';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatService {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createConversation(
    data: Partial<Conversation>,
    creatorId: string,
  ): Promise<Conversation> {
    const creator = await this.userRepo.findOne({ where: { id: creatorId } });
    if (!creator) {
      throw new Error('Créateur non trouvé');
    }

    const conversation = this.conversationRepo.create({
      ...data,
      participants: [creator],
      admins: [creator],
    });

    return this.conversationRepo.save(conversation);
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    data: Partial<Message>,
  ): Promise<Message> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new Error('Conversation non trouvée');
    }

    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    if (!sender) {
      throw new Error('Expéditeur non trouvé');
    }

    // Vérifier les permissions
    if (conversation.settings?.isReadOnly && !conversation.admins.includes(sender)) {
      throw new Error('Conversation en lecture seule');
    }

    const message = this.messageRepo.create({
      ...data,
      conversation,
      sender,
      status: MessageStatus.SENT,
    });

    const savedMessage = await this.messageRepo.save(message);

    // Mettre à jour la date du dernier message
    conversation.lastMessageAt = new Date();
    await this.conversationRepo.save(conversation);

    // Notifier tous les participants via WebSocket
    this.notifyParticipants(conversation, savedMessage);

    return savedMessage;
  }

  private notifyParticipants(conversation: Conversation, message: Message): void {
    conversation.participants.forEach((participant) => {
      this.server.to(participant.id).emit('newMessage', {
        conversationId: conversation.id,
        message,
      });
    });
  }

  async getConversationMessages(
    conversationId: string,
    options: {
      limit?: number;
      before?: Date;
      after?: Date;
      type?: MessageType[];
    } = {},
  ): Promise<Message[]> {
    const query = this.messageRepo
      .createQueryBuilder('message')
      .where('message.conversation.id = :conversationId', { conversationId })
      .orderBy('message.createdAt', 'DESC');

    if (options.before) {
      query.andWhere('message.createdAt < :before', { before: options.before });
    }

    if (options.after) {
      query.andWhere('message.createdAt > :after', { after: options.after });
    }

    if (options.type) {
      query.andWhere('message.type IN (:...types)', { types: options.type });
    }

    if (options.limit) {
      query.take(options.limit);
    }

    return query.getMany();
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['delivery'],
    });

    if (!message) {
      throw new Error('Message non trouvé');
    }

    if (!message.delivery) {
      message.delivery = {};
    }

    if (!message.delivery.readBy) {
      message.delivery.readBy = [];
    }

    if (!message.delivery.readBy.includes(userId)) {
      message.delivery.readBy.push(userId);
      message.delivery.readAt = new Date();
      await this.messageRepo.save(message);
    }
  }

  async pinMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['conversation', 'conversation.admins'],
    });

    if (!message) {
      throw new Error('Message non trouvé');
    }

    if (!message.conversation.admins.find(admin => admin.id === userId)) {
      throw new Error('Permission refusée');
    }

    message.isPinned = true;
    await this.messageRepo.save(message);

    if (!message.conversation.pinnedMessageIds) {
      message.conversation.pinnedMessageIds = [];
    }
    message.conversation.pinnedMessageIds.push(messageId);
    await this.conversationRepo.save(message.conversation);
  }

  async addReaction(
    messageId: string,
    userId: string,
    reaction: string,
  ): Promise<void> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message non trouvé');
    }

    if (!message.reactions) {
      message.reactions = [];
    }

    const reactionWithUser = `${reaction}:${userId}`;
    if (!message.reactions.includes(reactionWithUser)) {
      message.reactions.push(reactionWithUser);
      await this.messageRepo.save(message);
    }
  }

  async searchMessages(
    query: string,
    options: {
      conversationId?: string;
      userId?: string;
      type?: MessageType[];
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {},
  ): Promise<Message[]> {
    const queryBuilder = this.messageRepo
      .createQueryBuilder('message')
      .where('message.content ILIKE :query', { query: `%${query}%` });

    if (options.conversationId) {
      queryBuilder.andWhere('message.conversation.id = :conversationId', {
        conversationId: options.conversationId,
      });
    }

    if (options.userId) {
      queryBuilder.andWhere('message.sender.id = :userId', {
        userId: options.userId,
      });
    }

    if (options.type) {
      queryBuilder.andWhere('message.type IN (:...types)', {
        types: options.type,
      });
    }

    if (options.startDate) {
      queryBuilder.andWhere('message.createdAt >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options.endDate) {
      queryBuilder.andWhere('message.createdAt <= :endDate', {
        endDate: options.endDate,
      });
    }

    if (options.limit) {
      queryBuilder.take(options.limit);
    }

    return queryBuilder.getMany();
  }

  async getParticipants(conversationId: string): Promise<User[]> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new Error('Conversation non trouvée');
    }

    return conversation.participants;
  }

  async addParticipants(
    conversationId: string,
    participantIds: string[],
    addedBy: string,
  ): Promise<void> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['participants', 'admins'],
    });

    if (!conversation) {
      throw new Error('Conversation non trouvée');
    }

    // Vérifier les permissions
    const isAdmin = conversation.admins.some(admin => admin.id === addedBy);
    if (!isAdmin && !conversation.settings?.canParticipantsInvite) {
      throw new Error('Permission refusée');
    }

    const newParticipants = await this.userRepo.findByIds(participantIds);
    conversation.participants.push(...newParticipants);

    await this.conversationRepo.save(conversation);

    // Créer un message système
    await this.sendMessage(conversationId, addedBy, {
      type: MessageType.SYSTEM,
      content: `${newParticipants
        .map(p => p.name)
        .join(', ')} ont rejoint la conversation`,
      isSystemMessage: true,
    });
  }
}
