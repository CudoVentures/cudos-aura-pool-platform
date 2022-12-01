import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { NOT_EXISTS_INT } from '../../common/utils';

export class MinerDto {
    @IsNumber()
    @ApiProperty({ required: true, example: 1 })
        id: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'Farm Name' })
        name: string;

    static isNew(minerDto: MinerDto): boolean {
        return minerDto.id === NOT_EXISTS_INT;
    }
}
