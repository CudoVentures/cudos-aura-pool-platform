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

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({

        example: 'New address_for_receiving_rewards_from_pool',
    })
        address_for_receiving_rewards_from_pool: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'New leftover_reward_payout_address' })
        leftover_reward_payout_address: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'New maintenance_fee_payout_address' })
        maintenance_fee_payout_address: string;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 0.0001 })
        maintenance_fee_in_btc: number;

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
