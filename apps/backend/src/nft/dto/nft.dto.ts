import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class NFTDto {
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false, example: 1 })
        id: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'The coolest NFT' })
        name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'The new coolest NFT' })
        uri: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'The new coolest NFT' })
        data: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 200 })
        hashing_power: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 1000 })
        price: number;

    @IsDateString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ required: true, example: '2022-10-17T13:25:19.503Z' })
        expiration_date: number;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ required: true, example: 1 })
        collection_id: number;
}
