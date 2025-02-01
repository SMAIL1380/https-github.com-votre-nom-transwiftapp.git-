import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportGeneratorService } from '../services/report-generator.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ReportController {
  constructor(
    private readonly reportGeneratorService: ReportGeneratorService,
  ) {}

  @Get('compliance')
  async getComplianceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ): Promise<void> {
    const filePath = await this.reportGeneratorService.generateComplianceReport(
      new Date(startDate),
      new Date(endDate),
    );

    res.download(filePath);
  }

  @Get('expiration')
  async getExpirationReport(@Res() res: Response): Promise<void> {
    const filePath = await this.reportGeneratorService.generateExpirationReport();
    res.download(filePath);
  }
}
