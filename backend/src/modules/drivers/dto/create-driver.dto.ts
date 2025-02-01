import { IsEmail, IsString, IsOptional, IsPhoneNumber, IsBoolean, IsNumber, IsLatitude, IsLongitude } from 'class-validator';

export class CreateDriverDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  password: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsNumber()
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsLongitude()
  @IsOptional()
  longitude?: number;
}
