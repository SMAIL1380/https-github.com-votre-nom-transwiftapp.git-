import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { VehicleTypeService } from '../services/vehicle-type.service';
import { VehicleType, VehicleCategory } from '../entities/vehicle-type.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('vehicle-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehicleTypeController {
  constructor(
    private readonly vehicleTypeService: VehicleTypeService,
  ) {}

  @Post()
  @Roles('admin')
  async create(@Body() data: Partial<VehicleType>): Promise<VehicleType> {
    return this.vehicleTypeService.create(data);
  }

  @Get()
  async findAll(
    @Query('category') category?: VehicleCategory,
  ): Promise<VehicleType[]> {
    return this.vehicleTypeService.findAll(category);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<VehicleType> {
    return this.vehicleTypeService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<VehicleType>,
  ): Promise<VehicleType> {
    return this.vehicleTypeService.update(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string): Promise<void> {
    return this.vehicleTypeService.remove(id);
  }

  @Get('specifications/:category')
  async getSpecifications(
    @Param('category') category: VehicleCategory,
  ): Promise<any> {
    return this.vehicleTypeService.getSpecifications(category);
  }
}
