import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { Driver } from './entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { DriverDocument } from './entities/driver-document.entity';
import { DriverReview } from './entities/driver-review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Driver, Vehicle, DriverDocument, DriverReview]),
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
