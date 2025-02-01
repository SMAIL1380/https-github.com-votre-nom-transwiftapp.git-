import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { CreateDriverDocumentDto } from './dto/create-driver-document.dto';
import { CreateDriverReviewDto } from './dto/create-driver-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @Roles('admin')
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.driversService.findAll();
  }

  @Get('available')
  findAvailableDrivers(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius?: number,
  ) {
    return this.driversService.findAvailableDrivers(latitude, longitude, radius);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Get(':id/stats')
  getDriverStats(@Param('id') id: string) {
    return this.driversService.getDriverStats(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }

  @Post('documents')
  @Roles('admin')
  addDocument(@Body() createDocumentDto: CreateDriverDocumentDto) {
    return this.driversService.addDocument(createDocumentDto);
  }

  @Post('reviews')
  addReview(@Body() createReviewDto: CreateDriverReviewDto) {
    return this.driversService.addReview(createReviewDto);
  }

  @Get('documents/expired')
  @Roles('admin')
  getExpiredDocuments() {
    return this.driversService.checkExpiredDocuments();
  }

  @Get('documents/expiring')
  @Roles('admin')
  getDocumentsExpiringInDays(@Query('days') days?: number) {
    return this.driversService.checkDocumentsExpiringInDays(days);
  }
}
