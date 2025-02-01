import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DocumentStatsService } from '../services/document-stats.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('document-stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class DocumentStatsController {
  constructor(
    private readonly documentStatsService: DocumentStatsService,
  ) {}

  @Get('verification')
  async getVerificationStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.documentStatsService.getVerificationStats(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('compliance')
  async getDriverComplianceStats() {
    return this.documentStatsService.getDriverComplianceStats();
  }

  @Get('trends')
  async getVerificationTrends(@Query('days') days: number) {
    return this.documentStatsService.getVerificationTrends(days);
  }

  @Get('expiration-forecast')
  async getDocumentExpirationForecast(@Query('months') months: number) {
    return this.documentStatsService.getDocumentExpirationForecast(months);
  }
}
