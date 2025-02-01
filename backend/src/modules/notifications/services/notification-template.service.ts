import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationTemplate } from '../entities/notification-template.entity';
import { NotificationType, NotificationPriority } from '../entities/notification.entity';

@Injectable()
export class NotificationTemplateService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private templateRepo: Repository<NotificationTemplate>
  ) {}

  async createTemplate(data: {
    name: string;
    type: NotificationType;
    titleTemplate: string;
    bodyTemplate: string;
    defaultPriority?: NotificationPriority;
    defaultActions?: any[];
  }) {
    const template = this.templateRepo.create(data);
    return this.templateRepo.save(template);
  }

  async getTemplate(name: string) {
    return this.templateRepo.findOne({ where: { name } });
  }

  async updateTemplate(
    name: string,
    data: Partial<Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    await this.templateRepo.update({ name }, data);
    return this.getTemplate(name);
  }

  async deleteTemplate(name: string) {
    return this.templateRepo.delete({ name });
  }

  async getAllTemplates() {
    return this.templateRepo.find();
  }

  async getTemplatesByType(type: NotificationType) {
    return this.templateRepo.find({ where: { type } });
  }

  processTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  async generateNotificationContent(
    templateName: string,
    data: Record<string, any>
  ) {
    const template = await this.getTemplate(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    return {
      title: this.processTemplate(template.titleTemplate, data),
      body: this.processTemplate(template.bodyTemplate, data),
      type: template.type,
      priority: template.defaultPriority,
      actions: template.defaultActions,
    };
  }
}
