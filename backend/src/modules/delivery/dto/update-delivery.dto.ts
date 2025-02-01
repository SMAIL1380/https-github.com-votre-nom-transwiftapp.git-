import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateDeliveryDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  driverId?: string;

  @IsArray()
  @IsOptional()
  packagePhotos?: string[];

  @IsString()
  @IsOptional()
  signature?: string;

  @IsOptional()
  location?: {
    type: string;
    coordinates: number[];
  };
}
