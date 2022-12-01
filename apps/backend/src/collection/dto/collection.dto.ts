import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';
import { NOT_EXISTS_INT } from '../../common/utils';
import { NFTDto } from '../../nft/dto/nft.dto';

export class CollectionDto {
    @IsNumber()
    @ApiProperty({ required: false, example: 1 })
        id: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'Collection Name' })
        name: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false, example: 'My collection' })
        description?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false, example: 'mydenom' })
        denom_id: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 200 })
        hashing_power: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 2 })
        royalties: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false, example: 'my_payout_address' })
        payout_address: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'main image' })
        main_image: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'banner image' })
        banner_image: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 1 })
        farm_id: number;

    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ required: true,
        example: [{
            name: 'The coolest NFT 123',
            data: 'The new coolest NFT',
            hashing_power: '200',
            price: '1000',
            expiration_date: '2022-12-17T13:25:19.503Z',
            collection_id: 1,
        },
        {
            name: 'Not so cool nft',
            data: 'The new coolest NFT',
            hashing_power: '200',
            price: '1000',
            expiration_date: '2022-12-17T13:25:19.503Z',
            collection_id: 1,
        }],
        type: [NFTDto],
        description: 'NFTs to be offered for sale' })
        nfts: NFTDto[];

    constructor() {
        this.id = NOT_EXISTS_INT;
        this.name = '';
        this.description = '';
        this.denom_id = '';
        this.hashing_power = NOT_EXISTS_INT;
        this.royalties = NOT_EXISTS_INT;
        this.payout_address = '';
        this.main_image = '';
        this.banner_image = '';
        this.farm_id = NOT_EXISTS_INT;
        this.nfts = [];
    }

    isNew(): boolean {
        return this.id === NOT_EXISTS_INT;
    }

    static fromJson(json): CollectionDto {
        const collectionDto = new CollectionDto();

        collectionDto.id = parseInt(json.id ?? collectionDto.id);
        collectionDto.name = json.name ?? collectionDto.name;
        collectionDto.description = json.description ?? collectionDto.description;
        collectionDto.denom_id = json.denom_id ?? collectionDto.denom_id;
        collectionDto.hashing_power = parseInt(json.hashing_power ?? collectionDto.hashing_power);
        collectionDto.royalties = parseInt(json.royalties ?? collectionDto.royalties);
        collectionDto.payout_address = json.payout_address ?? collectionDto.payout_address;
        collectionDto.main_image = json.main_image ?? collectionDto.main_image;
        collectionDto.banner_image = json.banner_image ?? collectionDto.banner_image;
        collectionDto.farm_id = parseInt(json.farm_id ?? collectionDto.farm_id);
        collectionDto.nfts = json.nfts ? json.nfts.map((nftJson) => NFTDto.fromJson(nftJson)) : collectionDto.nfts;

        return collectionDto;
    }
}
