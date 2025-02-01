import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles('admin')
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateVehicleDto: Partial<CreateVehicleDto>) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }

  @Post(':id/assign/:driverId')
  @Roles('admin')
  assignToDriver(
    @Param('id') id: string,
    @Param('driverId') driverId: string,
  ) {
    return this.vehiclesService.assignToDriver(id, driverId);
  }

  @Post(':id/unassign')
  @Roles('admin')
  unassignFromDriver(@Param('id') id: string) {
    return this.vehiclesService.unassignFromDriver(id);
  }

  @Get('maintenance/expired-insurance')
  @Roles('admin')
  getExpiredInsurance() {
    return this.vehiclesService.checkExpiredInsurance();
  }

  @Get('maintenance/expiring-insurance')
  @Roles('admin')
  getExpiringInsurance(@Query('days') days?: number) {
    return this.vehiclesService.checkExpiringInsurance(days);
  }

  @Get('maintenance/expired-inspection')
  @Roles('admin')
  getExpiredTechnicalInspection() {
    return this.vehiclesService.checkExpiredTechnicalInspection();
  }

  @Get(':id/maintenance-status')
  getVehicleMaintenanceStatus(@Param('id') id: string) {
    return this.vehiclesService.getVehicleMaintenanceStatus(id);
  }
}
