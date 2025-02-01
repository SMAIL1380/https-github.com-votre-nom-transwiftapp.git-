import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { AlertSettingsService } from '../services/alert-settings.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Admin } from '../../admin/entities/admin.entity';
import { AlertSettings } from '../entities/alert-settings.entity';

@Controller('alert-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AlertSettingsController {
  constructor(
    private readonly alertSettingsService: AlertSettingsService,
  ) {}

  @Get()
  async getSettings(@CurrentUser() admin: Admin): Promise<AlertSettings> {
    return this.alertSettingsService.getAdminAlertSettings(admin.id);
  }

  @Put()
  async updateSettings(
    @CurrentUser() admin: Admin,
    @Body() settings: Partial<AlertSettings>,
  ): Promise<AlertSettings> {
    return this.alertSettingsService.updateAlertSettings(admin.id, settings);
  }
}
