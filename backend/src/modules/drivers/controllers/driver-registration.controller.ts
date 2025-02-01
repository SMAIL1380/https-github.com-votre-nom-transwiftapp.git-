import { Controller, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { DriverRegistrationService } from '../services/driver-registration.service';
import { CreateInternalDriverDto } from '../dto/create-internal-driver.dto';
import { CreateExternalDriverDto } from '../dto/create-external-driver.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('driver-registration')
export class DriverRegistrationController {
  constructor(
    private readonly driverRegistrationService: DriverRegistrationService,
  ) {}

  @Post('internal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  registerInternalDriver(@Body() dto: CreateInternalDriverDto) {
    return this.driverRegistrationService.registerInternalDriver(dto);
  }

  @Post('external')
  registerExternalDriver(@Body() dto: CreateExternalDriverDto) {
    return this.driverRegistrationService.registerExternalDriver(dto);
  }

  @Post('complete-registration')
  completeInternalRegistration(
    @Query('token') token: string,
    @Body('password') password: string,
  ) {
    return this.driverRegistrationService.completeInternalRegistration(token, password);
  }

  @Post('external/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  approveExternalDriver(
    @Param('id') id: string,
    @Body('adminId') adminId: string,
  ) {
    return this.driverRegistrationService.approveExternalDriver(id, adminId);
  }

  @Post('external/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  rejectExternalDriver(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.driverRegistrationService.rejectExternalDriver(id, reason);
  }

  @Post('external/:id/request-documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  requestAdditionalDocuments(
    @Param('id') id: string,
    @Body('documents') documents: string[],
  ) {
    return this.driverRegistrationService.requestAdditionalDocuments(id, documents);
  }
}
