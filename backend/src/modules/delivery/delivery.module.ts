import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { DeliveryGateway } from './delivery.gateway';
import { Delivery, DeliverySchema } from './schemas/delivery.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Delivery.name, schema: DeliverySchema },
    ]),
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService, DeliveryGateway],
  exports: [DeliveryService],
})
export class DeliveryModule {}
