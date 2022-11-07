import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ManufacturerDto {
    @IsNumber()
    @ApiProperty({ required: true, example: 1 })
        id: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'Farm Name' })
        name: string;
}
