import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { NOT_EXISTS_INT } from '../../common/utils';

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
    @IsOptional()
    @ApiProperty({ example: 'The new coolest NFT' })
        uri: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'The new coolest NFT' })
        data: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 200 })
        hashing_power: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 1000 })
        price: string;

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

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 1 })
        marketplace_nft_id: number;

    constructor() {
        this.id = '';
        this.name = '';
        this.uri = '';
        this.data = '';
        this.hashing_power = NOT_EXISTS_INT;
        this.price = '';
        this.expiration_date = NOT_EXISTS_INT;
        this.collection_id = NOT_EXISTS_INT;
        this.marketplace_nft_id = NOT_EXISTS_INT;
    }

    isNew(): boolean {
        return this.id === '';
    }

    static fromJson(json): NFTDto {
        const nftDto = new NFTDto();

        nftDto.id = nftDto.id ?? json.id;
        nftDto.name = nftDto.name ?? json.name;
        nftDto.uri = nftDto.uri ?? json.uri;
        nftDto.data = nftDto.data ?? json.data;
        nftDto.hashing_power = parseInt(nftDto.hashing_power ?? json.hashing_power);
        nftDto.price = nftDto.price ?? json.price;
        nftDto.expiration_date = parseInt(nftDto.expiration_date ?? json.expiration_date);
        nftDto.collection_id = parseInt(nftDto.collection_id ?? json.collection_id);
        nftDto.marketplace_nft_id = parseInt(nftDto.marketplace_nft_id ?? json.marketplace_nft_id);

        return nftDto;
    }
}
