import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
import { NOT_EXISTS_INT } from '../../common/utils';

export class FarmDto {
    @IsNumber()
    @ApiProperty({ required: true, example: 1 })
        id: number;

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
    @ApiProperty({ required: true, example: 10, description: 'Royalties for Cudos for first sale/mint of nft' })
        cudos_mint_nft_royalties_percent: number;

    @IsNumber()
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

    constructor() {
        this.id = NOT_EXISTS_INT;
        this.name = '';
        this.description = '';
        this.status = '';
        this.sub_account_name = '';
        this.primary_account_owner_name = '';
        this.primary_account_owner_email = '';
        this.location = '';
        this.cudos_mint_nft_royalties_percent = NOT_EXISTS_INT;
        this.cudos_resale_nft_royalties_percent = NOT_EXISTS_INT;
        this.resale_farm_royalties_cudos_address = '';
        this.address_for_receiving_rewards_from_pool = '';
        this.leftover_reward_payout_address = '';
        this.maintenance_fee_payout_address = '';
        this.maintenance_fee_in_btc = '';
        this.total_farm_hashrate = NOT_EXISTS_INT;
        this.manufacturers = [];
        this.miner_types = [];
        this.energy_source = [];
        this.images = [];
        this.profile_img = '';
        this.cover_img = '';
    }

    isNew(): boolean {
        return this.id === NOT_EXISTS_INT;
    }

    static fromJson(json): FarmDto {
        const farmDto = new FarmDto();

        farmDto.id = parseInt(json.id ?? farmDto.id);
        farmDto.name = json.name ?? farmDto.name;
        farmDto.description = json.description ?? farmDto.description;
        farmDto.status = json.status ?? farmDto.status;
        farmDto.sub_account_name = json.sub_account_name ?? farmDto.sub_account_name;
        farmDto.primary_account_owner_name = json.primary_account_owner_name ?? farmDto.primary_account_owner_name;
        farmDto.primary_account_owner_email = json.primary_account_owner_email ?? farmDto.primary_account_owner_email;
        farmDto.location = json.location ?? farmDto.location;
        farmDto.cudos_mint_nft_royalties_percent = parseInt(json.cudos_mint_nft_royalties_percent ?? farmDto.cudos_mint_nft_royalties_percent);
        farmDto.cudos_resale_nft_royalties_percent = parseInt(json.cudos_resale_nft_royalties_percent ?? farmDto.cudos_resale_nft_royalties_percent);
        farmDto.resale_farm_royalties_cudos_address = json.resale_farm_royalties_cudos_address ?? farmDto.resale_farm_royalties_cudos_address;
        farmDto.address_for_receiving_rewards_from_pool = json.address_for_receiving_rewards_from_pool ?? farmDto.address_for_receiving_rewards_from_pool;
        farmDto.leftover_reward_payout_address = json.leftover_reward_payout_address ?? farmDto.leftover_reward_payout_address;
        farmDto.maintenance_fee_payout_address = json.maintenance_fee_payout_address ?? farmDto.maintenance_fee_payout_address;
        farmDto.maintenance_fee_in_btc = json.maintenance_fee_in_btc ?? farmDto.maintenance_fee_in_btc;
        farmDto.total_farm_hashrate = parseInt(json.total_farm_hashrate ?? farmDto.total_farm_hashrate);
        farmDto.manufacturers = JSON.parse(json.manufacturers ?? farmDto.manufacturers);
        farmDto.miner_types = json.miner_types ?? farmDto.miner_types;
        farmDto.energy_source = json.energy_source ?? farmDto.energy_source;
        farmDto.images = json.images ?? farmDto.images;
        farmDto.profile_img = json.profile_img ?? farmDto.profile_img;
        farmDto.cover_img = json.cover_img ?? farmDto.cover_img;

        return farmDto;
    }

}
