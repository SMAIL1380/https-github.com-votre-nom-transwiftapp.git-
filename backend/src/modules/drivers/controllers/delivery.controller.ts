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
import { DeliveryManagementService } from '../services/delivery-management.service';
import { DeliveryStatus } from '../entities/delivery.entity';

@ApiTags('Gestion des livraisons')
@Controller('deliveries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryManagementService) {}

  // Création et mise à jour des livraisons
  @Post()
  @Roles('admin', 'dispatcher')
  @ApiOperation({ summary: 'Créer une nouvelle livraison' })
  @ApiResponse({ status: 201, description: 'Livraison créée avec succès' })
  async createDelivery(@Body() data: any) {
    try {
      return await this.deliveryService.createDelivery(data);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la création de la livraison',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id/status')
  @Roles('admin', 'dispatcher', 'driver')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une livraison' })
  async updateDeliveryStatus(
    @Param('id') id: string,
    @Body() data: { status: DeliveryStatus; details?: any },
  ) {
    try {
      return await this.deliveryService.updateDeliveryStatus(
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

  // Attribution des livraisons
  @Put(':id/assign')
  @Roles('admin', 'dispatcher')
  @ApiOperation({ summary: 'Attribuer une livraison' })
  async assignDelivery(
    @Param('id') id: string,
    @Body() data: { driverId: string; vehicleId: string },
  ) {
    try {
      return await this.deliveryService.assignDelivery(
        id,
        data.driverId,
        data.vehicleId,
      );
    } catch (error) {
      throw new HttpException(
        'Erreur lors de l\'attribution de la livraison',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Optimisation des routes
  @Get('routes/optimize')
  @Roles('admin', 'dispatcher')
  @ApiOperation({ summary: 'Optimiser les routes de livraison' })
  async optimizeRoutes(
    @Query('driverId') driverId: string,
    @Query('date') date: Date,
  ) {
    try {
      return await this.deliveryService.optimizeRoutes(driverId, date);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de l\'optimisation des routes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Suivi des livraisons
  @Get(':id/track')
  @Roles('admin', 'dispatcher', 'customer')
  @ApiOperation({ summary: 'Suivre une livraison' })
  async trackDelivery(@Param('id') id: string) {
    try {
      return await this.deliveryService.trackDelivery(id);
    } catch (error) {
      throw new HttpException(
        'Erreur lors du suivi de la livraison',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Gestion des preuves de livraison
  @Post(':id/proof')
  @Roles('driver')
  @ApiOperation({ summary: 'Soumettre une preuve de livraison' })
  async submitDeliveryProof(
    @Param('id') id: string,
    @Body() proofData: { signature?: string; photos?: string[]; notes?: string },
  ) {
    try {
      return await this.deliveryService.submitDeliveryProof(id, proofData);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la soumission de la preuve',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Gestion des retards
  @Post(':id/delay')
  @Roles('driver', 'dispatcher')
  @ApiOperation({ summary: 'Signaler un retard' })
  async recordDelay(
    @Param('id') id: string,
    @Body() delay: { reason: string; duration: number },
  ) {
    try {
      return await this.deliveryService.recordDelay(id, delay);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de l\'enregistrement du retard',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Rapports et statistiques
  @Get('statistics')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Obtenir les statistiques de livraison' })
  async getDeliveryStatistics(
    @Query() filters: {
      driverId?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    try {
      return await this.deliveryService.getDeliveryStatistics(filters);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des statistiques',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Gestion des feedbacks
  @Post(':id/feedback')
  @Roles('customer')
  @ApiOperation({ summary: 'Soumettre un feedback de livraison' })
  async submitDeliveryFeedback(
    @Param('id') id: string,
    @Body() feedback: { rating: number; comment?: string; issues?: string[] },
  ) {
    try {
      return await this.deliveryService.submitDeliveryFeedback(id, feedback);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la soumission du feedback',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
