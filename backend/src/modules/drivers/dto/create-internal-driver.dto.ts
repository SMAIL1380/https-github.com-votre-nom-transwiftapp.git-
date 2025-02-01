import { IsString, IsEmail, IsPhoneNumber, IsOptional } from 'class-validator';

export class CreateInternalDriverDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  address: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  licenseNumber: string;

  @IsString()
  socialSecurityNumber: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
