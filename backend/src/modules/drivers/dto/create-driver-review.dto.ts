import { IsString, IsNumber, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class CreateDriverReviewDto {
  @IsUUID()
  driverId: string;

  @IsString()
  userId: string;

  @IsString()
  deliveryId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
