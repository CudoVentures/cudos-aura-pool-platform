import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { NftStatus } from '../nft.types';

export class UpdateNFTStatusDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'minted' })
        status: NftStatus.MINTED | NftStatus.REMOVED;
}
