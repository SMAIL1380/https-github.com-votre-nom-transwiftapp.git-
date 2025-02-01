import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertSettings } from '../entities/alert-settings.entity';
import { Admin } from '../../admin/entities/admin.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class AlertSettingsService {
  constructor(
    @InjectRepository(AlertSettings)
    private alertSettingsRepository: Repository<AlertSettings>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private notificationsService: NotificationsService,
    private mailService: MailService,
  ) {}

  async getAdminAlertSettings(adminId: string): Promise<AlertSettings> {
    return this.alertSettingsRepository.findOne({
      where: { admin: { id: adminId } },
    });
  }

  async updateAlertSettings(
    adminId: string,
    settings: Partial<AlertSettings>,
  ): Promise<AlertSettings> {
    let alertSettings = await this.getAdminAlertSettings(adminId);
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
    });

    if (!alertSettings) {
      alertSettings = this.alertSettingsRepository.create({
        admin,
        ...settings,
      });
    } else {
      Object.assign(alertSettings, settings);
    }

    return this.alertSettingsRepository.save(alertSettings);
  }

  async sendAlert(
    adminId: string,
    type: string,
    message: string,
    data: any,
  ): Promise<void> {
    const settings = await this.getAdminAlertSettings(adminId);
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
    });

    if (!settings || !admin) {
      return;
    }

    // Vérifier si l'alerte est activée pour ce type
    if (!this.isAlertEnabled(settings, type)) {
      return;
    }

    // Envoyer la notification dans l'application
    if (settings.inAppNotifications) {
      await this.notificationsService.create(
        type,
        'Alerte Document',
        message,
        adminId,
        data,
      );
    }

    // Envoyer l'email si activé
    if (settings.emailNotifications) {
      await this.mailService.sendAlert(
        admin.email,
        message,
        data,
      );
    }
  }

  private isAlertEnabled(settings: AlertSettings, type: string): boolean {
    const alertTypes = {
      documentExpiring: settings.alertDocumentExpiring,
      documentExpired: settings.alertDocumentExpired,
      verificationFailed: settings.alertVerificationFailed,
      lowComplianceRate: settings.alertLowComplianceRate,
      newRegistration: settings.alertNewRegistration,
    };

    return alertTypes[type] || false;
  }

  async broadcastAlert(
    type: string,
    message: string,
    data: any,
  ): Promise<void> {
    const admins = await this.adminRepository.find({
      relations: ['alertSettings'],
    });

    const promises = admins.map(admin =>
      this.sendAlert(admin.id, type, message, data),
    );

    await Promise.all(promises);
  }
}
