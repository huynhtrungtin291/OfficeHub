import {IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength} from "class-validator";

export class CreateDepartmentDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(5)
    departmentCode: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    description: string;

    @IsOptional()
    @IsEmail()
    emailManager: string;

    @IsNotEmpty()
    @IsBoolean()
    isActive: boolean;
}