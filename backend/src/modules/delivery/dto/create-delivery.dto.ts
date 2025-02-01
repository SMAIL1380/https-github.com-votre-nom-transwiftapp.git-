import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  @IsNotEmpty()
  pickupAddress: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsString()
  @IsNotEmpty()
  packageSize: string;

  @IsNumber()
  @IsOptional()
  packageWeight?: number;

  @IsString()
  @IsOptional()
  packageDescription?: string;

  @IsArray()
  @IsOptional()
  packagePhotos?: string[];

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  specialInstructions?: string;
}
