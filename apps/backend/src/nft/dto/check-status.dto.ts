import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CheckStatusDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'tx_hash' })
        tx_hash: string;
}
