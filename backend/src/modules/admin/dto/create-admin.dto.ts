import { IsEmail, IsString, MinLength, IsArray, IsOptional } from 'class-validator';

export class CreateAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsArray()
  @IsOptional()
  roles?: string[];
}
