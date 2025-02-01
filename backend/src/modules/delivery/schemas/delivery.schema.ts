import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeliveryDocument = Delivery & Document;

@Schema({ timestamps: true })
export class Delivery {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  pickupAddress: string;

  @Prop({ required: true })
  deliveryAddress: string;

  @Prop({ required: true })
  packageSize: string;

  @Prop()
  packageWeight: number;

  @Prop()
  packageDescription: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  driverId: string;

  @Prop()
  price: number;

  @Prop()
  estimatedDeliveryTime: Date;

  @Prop({ type: [String] })
  packagePhotos: string[];

  @Prop()
  signature: string;

  @Prop({ type: Object })
  location: {
    type: string;
    coordinates: number[];
  };
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);
