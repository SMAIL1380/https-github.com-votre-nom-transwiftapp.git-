import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('driver/:driverId')
  getAllNotifications(@Param('driverId') driverId: string) {
    return this.notificationsService.getAllNotifications(driverId);
  }

  @Get('driver/:driverId/unread')
  getUnreadNotifications(@Param('driverId') driverId: string) {
    return this.notificationsService.getUnreadNotifications(driverId);
  }

  @Post(':id/mark-as-read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
