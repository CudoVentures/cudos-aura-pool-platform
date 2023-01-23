import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { NftJsonValidator } from '../../nft/nft.types';
import { CollectionFilterJsonValidator, CollectionJsonValidator } from '../collection.types';

export class ReqCreditCollection {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => CollectionJsonValidator)
        collectionDto: CollectionJsonValidator

    @IsArray()
    @ValidateNested()
    @Type(() => NftJsonValidator)
        nftDtos: NftJsonValidator[];
}

export class ReqEditCollection {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => CollectionJsonValidator)
        collectionDto: CollectionJsonValidator
}

export enum ModuleName {
    MARKETPLACE = 'marketplace',
    NFT = 'nft'
}

export class ReqUpdateCollectionChainData {
    @IsString()
    @IsNotEmpty()
        module: string;

    @IsArray()
    @IsNotEmpty()
        denomIds: string[];

    @IsArray()
    @IsNotEmpty()
        collectionIds: number[];

    @IsNumber()
        height: number;
}

export class ReqFetchCollectionsByFilter {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => CollectionFilterJsonValidator)
        collectionFilter: CollectionFilterJsonValidator
}

export class ReqFetchTopCollections {

    @IsNumber()
        timestampFrom: number;

    @IsNumber()
        timestampTo: number;
}

export class ReqFetchCollectionDetails {
    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: ['denom_id1', 'denom_id2'] })
        collectionIds: string[];
}
