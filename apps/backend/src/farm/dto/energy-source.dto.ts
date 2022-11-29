import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { NOT_EXISTS_INT } from '../../common/utils';

export class EnergySourceDto {
    @IsNumber()
    @ApiProperty({ required: true, example: 1 })
        id: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'Farm Name' })
        name: string;

    static isNew(energySourceDto: EnergySourceDto): boolean {
        return energySourceDto.id === NOT_EXISTS_INT;
    }
}
