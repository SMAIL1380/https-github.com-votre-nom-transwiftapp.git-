import { IsString, IsEmail, IsPhoneNumber, IsNotEmpty, IsOptional, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CompanyInfoDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsString()
  @IsNotEmpty()
  taxIdentificationNumber: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}

export class ExternalDriverRegistrationDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  licenseExpiryDate: Date;

  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @ValidateNested()
  @Type(() => CompanyInfoDto)
  @IsOptional()
  companyInfo?: CompanyInfoDto;

  @IsString()
  @IsNotEmpty()
  insuranceNumber: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  insuranceExpiryDate: Date;
}
