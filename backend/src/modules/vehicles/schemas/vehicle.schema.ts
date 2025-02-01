import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema({ timestamps: true })
export class Vehicle {
  @Prop({ required: true })
  plateNumber: string;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  model: string;

  @Prop()
  year: number;

  @Prop()
  color: string;

  @Prop({ type: String, enum: ['active', 'maintenance', 'inactive'] })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Driver' })
  currentDriver: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'MaintenanceRecord' }] })
  maintenanceRecords: string[];

  @Prop()
  lastMaintenanceDate: Date;

  @Prop()
  nextMaintenanceDate: Date;

  @Prop()
  insuranceExpiryDate: Date;

  @Prop()
  technicalInspectionDate: Date;

  @Prop({ type: Object })
  specifications: Record<string, any>;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
