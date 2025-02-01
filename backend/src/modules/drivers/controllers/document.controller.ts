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
import { DocumentManagementService } from '../services/document-management.service';
import { DocumentStatus, DocumentType } from '../entities/document.entity';

@ApiTags('Gestion des documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentManagementService) {}

  // Création et mise à jour des documents
  @Post()
  @Roles('admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Créer un nouveau document' })
  @ApiResponse({ status: 201, description: 'Document créé avec succès' })
  async createDocument(@Body() data: any) {
    try {
      return await this.documentService.createDocument(data);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la création du document',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id/status')
  @Roles('admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un document' })
  async updateDocumentStatus(
    @Param('id') id: string,
    @Body() data: { status: DocumentStatus; verificationData?: any },
  ) {
    try {
      return await this.documentService.updateDocumentStatus(
        id,
        data.status,
        data.verificationData,
      );
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la mise à jour du statut',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Vérification et validation
  @Post(':id/verify')
  @Roles('admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Vérifier un document' })
  async verifyDocument(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    try {
      return await this.documentService.verifyDocument(id, userId);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la vérification du document',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Gestion des rappels
  @Put(':id/reminders')
  @Roles('admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Configurer les rappels pour un document' })
  async setupDocumentReminders(
    @Param('id') id: string,
    @Body('reminderDays') reminderDays: number[],
  ) {
    try {
      return await this.documentService.setupDocumentReminders(id, reminderDays);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la configuration des rappels',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('expiring')
  @Roles('admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Obtenir la liste des documents expirants' })
  async checkExpiringDocuments() {
    try {
      return await this.documentService.checkExpiringDocuments();
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la vérification des documents expirants',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Archivage
  @Post(':id/archive')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Archiver un document' })
  async archiveDocument(@Param('id') id: string) {
    try {
      return await this.documentService.archiveDocument(id);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de l\'archivage du document',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('cleanup')
  @Roles('admin')
  @ApiOperation({ summary: 'Nettoyer les documents expirés' })
  async cleanupExpiredDocuments() {
    try {
      await this.documentService.cleanupExpiredDocuments();
      return { message: 'Nettoyage effectué avec succès' };
    } catch (error) {
      throw new HttpException(
        'Erreur lors du nettoyage des documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Rapports et statistiques
  @Get('statistics')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Obtenir les statistiques des documents' })
  async getDocumentStatistics(
    @Query()
    filters: {
      type?: DocumentType;
      status?: DocumentStatus;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    try {
      return await this.documentService.getDocumentStatistics(filters);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des statistiques',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Partage et accès
  @Post(':id/share')
  @Roles('admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Partager un document' })
  async shareDocument(
    @Param('id') id: string,
    @Body() data: { userId: string; expiresIn?: number },
  ) {
    try {
      return await this.documentService.shareDocument(
        id,
        data.userId,
        data.expiresIn,
      );
    } catch (error) {
      throw new HttpException(
        'Erreur lors du partage du document',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
