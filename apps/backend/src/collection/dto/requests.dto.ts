import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from 'class-validator';
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

export enum ModuleName {
    MARKETPLACE = 'marketplace',
    NFT = 'nft'
}

export class ReqUpdateCollectionChainData {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'marketplace' })
        module: string;

    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: ['denom_id1', 'denom_id2'] })
        denomIds: string[];
}

export class ReqFetchCollectionsByFilter {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => CollectionFilterJsonValidator)
        collectionFilter: CollectionFilterJsonValidator
}

export class ReqFetchCollectionDetails {
    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: ['denom_id1', 'denom_id2'] })
        collectionIds: string[];
}
