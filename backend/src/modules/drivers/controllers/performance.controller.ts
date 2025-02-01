import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PerformanceService } from '../services/performance.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { MetricPeriod, MetricType } from '../entities/performance-metric.entity';

@Controller('driver-performance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerformanceController {
  constructor(
    private readonly performanceService: PerformanceService,
  ) {}

  @Post(':driverId/metrics')
  @Roles('admin')
  async createMetric(
    @Param('driverId') driverId: string,
    @Body() data: {
      metricType: MetricType;
      period: MetricPeriod;
      value: number;
      target: number;
      startDate: string;
      endDate: string;
      details?: any;
      comments?: string;
    },
  ) {
    return this.performanceService.createMetric(driverId, {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
  }

  @Get(':driverId/metrics')
  async getDriverMetrics(
    @Param('driverId') driverId: string,
    @Query('period') period: MetricPeriod,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.performanceService.getDriverMetrics(
      driverId,
      period,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':driverId/score')
  async getOverallScore(
    @Param('driverId') driverId: string,
  ) {
    return {
      score: await this.performanceService.calculateOverallScore(driverId),
    };
  }

  @Get(':driverId/report')
  @Roles('admin')
  async getPerformanceReport(
    @Param('driverId') driverId: string,
  ) {
    return this.performanceService.generatePerformanceReport(driverId);
  }
}
