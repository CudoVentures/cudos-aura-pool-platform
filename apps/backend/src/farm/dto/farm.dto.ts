import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class FarmDto {
    @IsNumber()
    @ApiProperty({ required: true, example: 1 })
        id?: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'Farm Name' })
        name: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false, example: 'My farmy farm for farming' })
        description: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false, example: 'queued' })
        status: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'sub_account_name' })
        sub_account_name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'Somewhere' })
        primary_account_owner_name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'Somewhere' })
        primary_account_owner_email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'Somewhere' })
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
    @ApiProperty({
        required: true,
        example: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    })
        address_for_receiving_rewards_from_pool: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' })
        leftover_reward_payout_address: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' })
        maintenance_fee_payout_address: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: '0.0001' })
        maintenance_fee_in_btc: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 100.01, description: 'Total farm hashrate of all miners' })
        total_farm_hashrate: number;

    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: ['Bitmain', 'Canaan', 'MicroBT', 'Bitfury'], type: [String], description: 'Manufacturers of miners' })
        manufacturers: string[];

    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: ['AntMiner S19', 'AntMiner S19 Pro'], type: [String], description: 'Miner types/models' })
        miner_types: string[];

    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: ['Oil', 'Solar'], type: [String], description: 'Energy source for the miners' })
        energy_source: string[];

    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: ['snimka 1', 'snimka 2'], type: [String], description: 'Farm images' })
        images: string[];

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'snimka 1', type: String, description: 'Farm images' })
        profile_img: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'snimka 1', type: String, description: 'Farm images' })
        cover_img: string;
}
