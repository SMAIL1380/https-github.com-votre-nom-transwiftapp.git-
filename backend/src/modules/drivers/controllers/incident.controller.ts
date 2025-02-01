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
import { IncidentManagementService } from '../services/incident-management.service';
import { IncidentStatus, IncidentType } from '../entities/incident.entity';

@ApiTags('Gestion des incidents')
@Controller('incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentController {
  constructor(private readonly incidentService: IncidentManagementService) {}

  // Création et mise à jour des incidents
  @Post()
  @Roles('driver', 'dispatcher')
  @ApiOperation({ summary: 'Signaler un nouvel incident' })
  @ApiResponse({ status: 201, description: 'Incident créé avec succès' })
  async createIncident(@Body() data: any) {
    try {
      return await this.incidentService.createIncident(data);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la création de l\'incident',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id/status')
  @Roles('admin', 'manager', 'dispatcher')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un incident' })
  async updateIncidentStatus(
    @Param('id') id: string,
    @Body() data: { status: IncidentStatus; details?: any },
  ) {
    try {
      return await this.incidentService.updateIncidentStatus(
        id,
        data.status,
        data.details,
      );
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la mise à jour du statut',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Suivi et analyse
  @Get('statistics')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Obtenir les statistiques des incidents' })
  async getIncidentStatistics(
    @Query()
    filters: {
      startDate?: Date;
      endDate?: Date;
      type?: IncidentType;
      driverId?: string;
    },
  ) {
    try {
      return await this.incidentService.getIncidentStatistics(filters);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des statistiques',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Notifications et alertes
  @Post(':id/notify')
  @Roles('admin', 'manager', 'dispatcher')
  @ApiOperation({ summary: 'Envoyer une notification d\'incident' })
  async notifyIncident(@Param('id') id: string) {
    try {
      await this.incidentService.notifyIncident(id);
      return { message: 'Notifications envoyées avec succès' };
    } catch (error) {
      throw new HttpException(
        'Erreur lors de l\'envoi des notifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Rapports et documentation
  @Get(':id/report')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Générer un rapport d\'incident' })
  async generateIncidentReport(@Param('id') id: string) {
    try {
      return await this.incidentService.generateIncidentReport(id);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la génération du rapport',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
