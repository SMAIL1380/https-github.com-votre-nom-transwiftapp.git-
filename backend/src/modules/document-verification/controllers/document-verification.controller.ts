import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DocumentVerificationService } from '../services/document-verification.service';
import { DocumentType, VerificationStatus } from '../entities/document-verification.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('document-verification')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentVerificationController {
  constructor(
    private readonly documentVerificationService: DocumentVerificationService,
  ) {}

  @Post()
  createVerification(
    @Body() data: {
      driverId: string;
      documentType: DocumentType;
      documentUrl: string;
      documentNumber: string;
      issueDate: string;
      expiryDate: string;
      metadata?: any;
    },
  ) {
    return this.documentVerificationService.createVerification(
      data.driverId,
      data.documentType,
      data.documentUrl,
      data.documentNumber,
      new Date(data.issueDate),
      new Date(data.expiryDate),
      data.metadata,
    );
  }

  @Post(':id/status')
  @Roles('admin')
  updateStatus(
    @Param('id') id: string,
    @Body() data: {
      status: VerificationStatus;
      details: any;
    },
  ) {
    return this.documentVerificationService.updateVerificationStatus(
      id,
      data.status,
      data.details,
    );
  }

  @Get('expiring')
  @Roles('admin')
  getExpiringDocuments(@Query('days') days?: number) {
    return this.documentVerificationService.checkExpiringDocuments(days);
  }

  @Get('expired')
  @Roles('admin')
  getExpiredDocuments() {
    return this.documentVerificationService.getExpiredDocuments();
  }

  @Get('driver/:driverId')
  getDriverDocuments(@Param('driverId') driverId: string) {
    return this.documentVerificationService.getDriverDocuments(driverId);
  }

  @Get('status/:status')
  @Roles('admin')
  getDocumentsByStatus(@Param('status') status: VerificationStatus) {
    return this.documentVerificationService.getDocumentsByStatus(status);
  }

  @Post(':id/retry')
  @Roles('admin')
  retryVerification(@Param('id') id: string) {
    return this.documentVerificationService.retryAutoVerification(id);
  }
}
