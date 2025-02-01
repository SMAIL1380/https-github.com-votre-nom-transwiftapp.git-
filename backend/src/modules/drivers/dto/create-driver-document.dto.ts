import { IsString, IsOptional, IsDate, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDriverDocumentDto {
  @IsString()
  type: string;

  @IsString()
  documentNumber: string;

  @IsString()
  documentUrl: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiryDate?: Date;

  @IsUUID()
  driverId: string;
}
