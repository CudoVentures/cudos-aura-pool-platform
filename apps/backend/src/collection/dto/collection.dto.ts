import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';
import { NFTDto } from '../../nft/dto/nft.dto';

export class CollectionDto {
    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false, example: 1 })
        id?: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'Collection Name' })
        name: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false, example: 'My collection' })
        description?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'mydenom' })
        denom_id: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 200 })
        hashing_power: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 2 })
        royalties: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 5 })
        maintenance_fee: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'my_payout_address' })
        payout_address: string;

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
}
