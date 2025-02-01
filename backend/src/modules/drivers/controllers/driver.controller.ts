import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { DriverManagementService } from '../services/driver-management.service';

@ApiTags('Gestion des chauffeurs')
@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriverController {
  constructor(private readonly driverService: DriverManagementService) {}

  // Endpoints pour les chauffeurs externes
  @Post('external')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Créer un nouveau chauffeur externe' })
  @ApiResponse({ status: 201, description: 'Chauffeur externe créé avec succès' })
  async createExternalDriver(@Body() data: any) {
    try {
      return await this.driverService.createExternalDriver(data);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la création du chauffeur externe',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('external')
  @Roles('admin', 'manager', 'dispatcher')
  @ApiOperation({ summary: 'Obtenir la liste des chauffeurs externes' })
  async getExternalDrivers(@Query() filters: any) {
    try {
      return await this.driverService.getExternalDrivers(filters);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des chauffeurs externes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('external/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Mettre à jour un chauffeur externe' })
  async updateExternalDriver(@Param('id') id: string, @Body() data: any) {
    try {
      return await this.driverService.updateExternalDriver(id, data);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la mise à jour du chauffeur externe',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Endpoints pour les chauffeurs internes
  @Post('internal')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Créer un nouveau chauffeur interne' })
  @ApiResponse({ status: 201, description: 'Chauffeur interne créé avec succès' })
  async createInternalDriver(@Body() data: any) {
    try {
      return await this.driverService.createInternalDriver(data);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la création du chauffeur interne',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('internal')
  @Roles('admin', 'hr', 'manager', 'dispatcher')
  @ApiOperation({ summary: 'Obtenir la liste des chauffeurs internes' })
  async getInternalDrivers(@Query() filters: any) {
    try {
      return await this.driverService.getInternalDrivers(filters);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des chauffeurs internes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('internal/:id')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Mettre à jour un chauffeur interne' })
  async updateInternalDriver(@Param('id') id: string, @Body() data: any) {
    try {
      return await this.driverService.updateInternalDriver(id, data);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la mise à jour du chauffeur interne',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Gestion des performances
  @Put(':id/performance')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Mettre à jour les performances d\'un chauffeur' })
  async updateDriverPerformance(
    @Param('id') id: string,
    @Body() data: { isExternal: boolean; performance: any },
  ) {
    try {
      return await this.driverService.updateDriverPerformance(
        id,
        data.isExternal,
        data.performance,
      );
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la mise à jour des performances',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Gestion des disponibilités
  @Put(':id/availability')
  @Roles('admin', 'manager', 'dispatcher')
  @ApiOperation({ summary: 'Mettre à jour la disponibilité d\'un chauffeur' })
  async updateDriverAvailability(
    @Param('id') id: string,
    @Body() data: { isExternal: boolean; isAvailable: boolean },
  ) {
    try {
      return await this.driverService.updateDriverAvailability(
        id,
        data.isExternal,
        data.isAvailable,
      );
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la mise à jour de la disponibilité',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Statistiques et rapports
  @Get(':id/statistics')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Obtenir les statistiques d\'un chauffeur' })
  async getDriverStatistics(
    @Param('id') id: string,
    @Query('isExternal') isExternal: boolean,
  ) {
    try {
      return await this.driverService.getDriverStatistics(id, isExternal);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des statistiques',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Gestion des formations
  @Post(':id/training')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Ajouter une formation pour un chauffeur' })
  async addTraining(@Param('id') id: string, @Body() trainingData: any) {
    try {
      return await this.driverService.addTraining(id, trainingData);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de l\'ajout de la formation',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Gestion des bonus/malus
  @Post(':id/bonus')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Attribuer un bonus/malus à un chauffeur' })
  async updateDriverBonus(
    @Param('id') id: string,
    @Body() data: { isExternal: boolean; amount: number },
  ) {
    try {
      return await this.driverService.updateDriverBonus(
        id,
        data.isExternal,
        data.amount,
      );
    } catch (error) {
      throw new HttpException(
        'Erreur lors de l\'attribution du bonus/malus',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
