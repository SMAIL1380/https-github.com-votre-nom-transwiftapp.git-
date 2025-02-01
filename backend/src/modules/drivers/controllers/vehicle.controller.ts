import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { VehicleManagementService } from '../services/vehicle-management.service';

@ApiTags('Gestion des véhicules')
@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleManagementService) {}

  // Gestion des véhicules
  @Post()
  @Roles('admin', 'fleet-manager')
  @ApiOperation({ summary: 'Créer un nouveau véhicule' })
  @ApiResponse({ status: 201, description: 'Véhicule créé avec succès' })
  async createVehicle(@Body() data: any) {
    try {
      return await this.vehicleService.createVehicle(data);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la création du véhicule',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @Roles('admin', 'fleet-manager', 'dispatcher')
  @ApiOperation({ summary: 'Obtenir la liste des véhicules' })
  async getVehicles(@Query() filters: any) {
    try {
      return await this.vehicleService.getVehicles(filters);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des véhicules',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @Roles('admin', 'fleet-manager')
  @ApiOperation({ summary: 'Mettre à jour un véhicule' })
  async updateVehicle(@Param('id') id: string, @Body() data: any) {
    try {
      return await this.vehicleService.updateVehicle(id, data);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la mise à jour du véhicule',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Gestion de la maintenance
  @Post(':id/maintenance')
  @Roles('admin', 'fleet-manager', 'maintenance')
  @ApiOperation({ summary: 'Planifier une maintenance' })
  async scheduleMaintenanceRecord(
    @Param('id') id: string,
    @Body() data: any,
  ) {
    try {
      return await this.vehicleService.scheduleMaintenanceRecord({
        ...data,
        vehicle: { id },
      });
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la planification de la maintenance',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('maintenance/:id/complete')
  @Roles('admin', 'fleet-manager', 'maintenance')
  @ApiOperation({ summary: 'Compléter une maintenance' })
  async completeMaintenanceRecord(
    @Param('id') id: string,
    @Body() data: any,
  ) {
    try {
      return await this.vehicleService.completeMaintenanceRecord(id, data);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la complétion de la maintenance',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Gestion des documents
  @Post(':id/documents')
  @Roles('admin', 'fleet-manager')
  @ApiOperation({ summary: 'Ajouter des documents au véhicule' })
  async updateVehicleDocuments(
    @Param('id') id: string,
    @Body() documents: any[],
  ) {
    try {
      return await this.vehicleService.updateVehicleDocuments(id, documents);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de l\'ajout des documents',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Suivi de la localisation
  @Put(':id/location')
  @Roles('admin', 'fleet-manager', 'dispatcher')
  @ApiOperation({ summary: 'Mettre à jour la position du véhicule' })
  async updateVehicleLocation(
    @Param('id') id: string,
    @Body() location: { latitude: number; longitude: number },
  ) {
    try {
      return await this.vehicleService.updateVehicleLocation(id, location);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la mise à jour de la position',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Gestion du carburant
  @Post(':id/refuel')
  @Roles('admin', 'fleet-manager', 'driver')
  @ApiOperation({ summary: 'Enregistrer un plein de carburant' })
  async recordFuelRefill(
    @Param('id') id: string,
    @Body() data: { amount: number; cost: number; mileage: number },
  ) {
    try {
      return await this.vehicleService.recordFuelRefill(id, data);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de l\'enregistrement du plein',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Statistiques et rapports
  @Get(':id/statistics')
  @Roles('admin', 'fleet-manager')
  @ApiOperation({ summary: 'Obtenir les statistiques d\'un véhicule' })
  async getVehicleStatistics(@Param('id') id: string) {
    try {
      return await this.vehicleService.getVehicleStatistics(id);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des statistiques',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Gestion des équipements
  @Put(':id/equipment')
  @Roles('admin', 'fleet-manager', 'maintenance')
  @ApiOperation({ summary: 'Mettre à jour l\'équipement d\'un véhicule' })
  async updateVehicleEquipment(
    @Param('id') id: string,
    @Body() equipment: { name: string; status: string },
  ) {
    try {
      return await this.vehicleService.updateVehicleEquipment(id, equipment);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la mise à jour de l\'équipement',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Planification de la maintenance
  @Get('maintenance/schedule')
  @Roles('admin', 'fleet-manager', 'maintenance')
  @ApiOperation({ summary: 'Obtenir le planning de maintenance' })
  async getMaintenanceSchedule(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    try {
      return await this.vehicleService.getMaintenanceSchedule(startDate, endDate);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération du planning',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
