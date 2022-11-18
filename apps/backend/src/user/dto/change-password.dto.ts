import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'old_password123' })
        old_password: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'new_password123' })
        password: string;
}
