import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { FarmStatus } from '../utils';

export class UpdateFarmStatusDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: FarmStatus.APPROVED })
        status: FarmStatus.APPROVED | FarmStatus.REJECTED;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 10, description: 'Royalties for Cudos for first sale/mint of nft' })
        cudos_mint_nft_royalties_percent: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 2.5, description: 'Royalties for Cudos for first resale of nft' })
        cudos_resale_nft_royalties_percent: number;
}
