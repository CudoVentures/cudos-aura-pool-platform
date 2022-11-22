import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';

export class UpdateFarmDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'New Name' })
        name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'New Description' })
        description: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'New Sub account name' })
        sub_account_name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'New Location' })
        location: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 10, description: 'Royalties for Cudos for first sale/mint of nft' })
        cudos_mint_nft_royalties_percent: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 2.5, description: 'Royalties for Cudos for first resale of nft' })
        cudos_resale_nft_royalties_percent: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        example: 'cudos14h7pdf8g2kkjgum5dntz80s5lhtrw3lk2uswk0',
    })
        resale_farm_royalties_cudos_address: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({

        example: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    })
        address_for_receiving_rewards_from_pool: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' })
        leftover_reward_payout_address: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' })
        maintenance_fee_payout_address: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: '0.0001' })
        maintenance_fee_in_btc: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 100.01, description: 'New total farm hashrate of all miners' })
        total_farm_hashrate: number;

    @IsArray()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ required: true, example: ['Bitmain', 'Canaan', 'MicroBT', 'Bitfury'], type: [String], description: 'New manufacturers of miners' })
        manufacturers: string[];

    @IsArray()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ required: true, example: ['AntMiner S19', 'AntMiner S19 Pro'], type: [String], description: 'New miner types/models' })
        miner_types: string[];

    @IsArray()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ required: true, example: ['Oil', 'Solar'], type: [String], description: 'New energy source for the miners' })
        energy_source: string[];
}
