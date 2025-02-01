import { IsString, IsEmail, IsPhoneNumber, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class VehicleInfoDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsEnum(['3m3', '6m3', '9m3', '12m3', '20m3'])
  volume: string;

  @IsString()
  registrationNumber: string;

  @IsOptional()
  @IsString()
  liftgate?: string;

  @IsOptional()
  @IsString()
  plsc?: string;
}

class CompanyInfoDto {
  @IsString()
  companyName: string;

  @IsString()
  kbis: string;

  @IsString()
  vatNumber: string;

  @IsString()
  urssafCertificate: string;

  @IsString()
  cargoInsurance: string;

  @IsString()
  vehicleInsurance: string;

  @IsString()
  companyBankAccount: string;
}

export class CreateExternalDriverDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  address: string;

  @ValidateNested()
  @Type(() => CompanyInfoDto)
  companyInfo: CompanyInfoDto;

  @ValidateNested()
  @Type(() => VehicleInfoDto)
  vehicleInfo: VehicleInfoDto;

  @IsOptional()
  @IsString({ each: true })
  additionalDocuments?: string[];
}
