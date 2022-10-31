import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @IsEmail()
    @ApiProperty({ required: true, example: 'mail@mail.com' })
        email: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ required: false, example: 'John Smith' })
        name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ required: false, example: 'cudos1akak4uxq0mn5qq38nhm5dahghfqt6wn9g4zc7u' })
        cudos_address: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: '12345' })
        password: string;
}
