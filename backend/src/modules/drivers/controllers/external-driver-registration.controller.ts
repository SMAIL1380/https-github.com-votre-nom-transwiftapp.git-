import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ExternalDriverRegistrationService } from '../services/external-driver-registration.service';
import { ExternalDriverRegistrationDto } from '../dtos/external-driver-registration.dto';

@Controller('driver-registration/external')
export class ExternalDriverRegistrationController {
  constructor(
    private readonly registrationService: ExternalDriverRegistrationService,
  ) {}

  @Post()
  async submitRegistration(@Body() dto: ExternalDriverRegistrationDto) {
    return this.registrationService.submitRegistration(dto);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approveRegistration(
    @Param('id') id: string,
    @CurrentUser() admin: any,
    @Body('comment') comment?: string,
  ) {
    return this.registrationService.approveRegistration(id, admin.id, comment);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async rejectRegistration(
    @Param('id') id: string,
    @CurrentUser() admin: any,
    @Body('reason') reason: string,
  ) {
    if (!reason) {
      throw new BadRequestException('La raison du rejet est requise');
    }
    return this.registrationService.rejectRegistration(id, admin.id, reason);
  }

  @Post('complete-registration')
  async completeRegistration(
    @Query('token') token: string,
    @Body('password') password: string,
  ) {
    return this.registrationService.completeRegistration(token, password);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getPendingRegistrations() {
    return this.registrationService.getPendingRegistrations();
  }

  @Get('validate-token')
  async validateActivationToken(@Query('token') token: string) {
    return this.registrationService.getRegistrationByToken(token);
  }
}
