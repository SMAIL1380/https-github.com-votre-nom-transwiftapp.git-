import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('location/:driverId')
  updateDriverLocation(
    @Param('driverId') driverId: string,
    @Body() locationData: {
      latitude: number;
      longitude: number;
      speed?: number;
      heading?: number;
      accuracy?: number;
      altitude?: number;
    },
  ) {
    return this.trackingService.updateDriverLocation(
      driverId,
      locationData.latitude,
      locationData.longitude,
      locationData.speed,
      locationData.heading,
      locationData.accuracy,
      locationData.altitude,
    );
  }

  @Get('location/:driverId')
  getDriverLocation(@Param('driverId') driverId: string) {
    return this.trackingService.getDriverLocation(driverId);
  }

  @Get('history/:driverId')
  @Roles('admin')
  getDriverLocationHistory(
    @Param('driverId') driverId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.trackingService.getDriverLocationHistory(
      driverId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('active-drivers')
  @Roles('admin')
  getActiveDriversLocations() {
    return this.trackingService.getActiveDriversLocations();
  }

  @Get('stats/:driverId')
  @Roles('admin')
  getDriverStats(
    @Param('driverId') driverId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.trackingService.calculateDriverStats(
      driverId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
