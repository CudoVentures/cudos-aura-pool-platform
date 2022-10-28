
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { FarmStatus } from '../utils';

export class UpdateFarmStatusDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: FarmStatus.APPROVED })
        status: FarmStatus.APPROVED | FarmStatus.REJECTED;
}
