import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @IsEmail()
    @ApiProperty({ required: false, example: 'new_mail@mail.com' })
        email: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ required: false, example: 'Name Surname' })
        name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ required: false, example: 'new payout address' })
        payout_address: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ required: false, example: 'new cudos address' })
        cudos_address: string;
}
