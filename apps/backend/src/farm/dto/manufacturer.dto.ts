import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { NOT_EXISTS_INT } from '../../common/utils';

export class ManufacturerDto {
    @IsNumber()
    @ApiProperty({ required: true, example: 1 })
        id: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'Farm Name' })
        name: string;

    static isNew(manufacturerDto: ManufacturerDto): boolean {
        return manufacturerDto.id === NOT_EXISTS_INT;
    }
}
