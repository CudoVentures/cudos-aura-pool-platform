import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { NftStatus } from '../utils';

export class UpdateNFTStatusDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'approved' })
        status: NftStatus.APPROVED | NftStatus.REJECTED;
}
