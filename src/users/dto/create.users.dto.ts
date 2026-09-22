import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString,
         MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  avatar?: string | null;

  @IsOptional()
  @IsEnum(['admin', 'manager', 'employee'])
  role?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  department: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  position: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(['online', 'offline'])
  status?: string;
}
