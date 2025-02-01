import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@Controller('deliveries')
@UseGuards(JwtAuthGuard)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post()
  create(@Request() req, @Body() createDeliveryDto: CreateDeliveryDto) {
    return this.deliveryService.create(req.user.userId, createDeliveryDto);
  }

  @Get()
  findAll(@Request() req) {
    if (req.user.role === 'admin') {
      return this.deliveryService.findAll();
    }
    if (req.user.role === 'driver') {
      return this.deliveryService.findByDriver(req.user.userId);
    }
    return this.deliveryService.findByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveryService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDeliveryDto: UpdateDeliveryDto) {
    return this.deliveryService.update(id, updateDeliveryDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.deliveryService.updateStatus(id, status);
  }

  @Patch(':id/location')
  updateLocation(
    @Param('id') id: string,
    @Body('coordinates') coordinates: number[],
  ) {
    return this.deliveryService.updateLocation(id, coordinates);
  }

  @Post(':id/photos')
  addPhoto(
    @Param('id') id: string,
    @Body('photoUrl') photoUrl: string,
  ) {
    return this.deliveryService.addPhoto(id, photoUrl);
  }

  @Post(':id/signature')
  addSignature(
    @Param('id') id: string,
    @Body('signatureUrl') signatureUrl: string,
  ) {
    return this.deliveryService.addSignature(id, signatureUrl);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveryService.remove(id);
  }
}
