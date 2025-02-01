import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { LocationHistory } from './entities/location-history.entity';
import { Driver } from '../drivers/entities/driver.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocationHistory, Driver]),
  ],
  controllers: [TrackingController],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
