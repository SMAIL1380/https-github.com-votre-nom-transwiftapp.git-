import { IsString, IsNumber, IsOptional, IsDate, IsObject, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class VehicleDimensionsDto {
  @IsNumber()
  length: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsNumber()
  maxWeight: number;
}

export class CreateVehicleDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsNumber()
  year: number;

  @IsString()
  plateNumber: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsObject()
  @IsOptional()
  @Type(() => VehicleDimensionsDto)
  dimensions?: VehicleDimensionsDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  insuranceNumber?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  insuranceExpiryDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  technicalInspectionDate?: Date;
}
