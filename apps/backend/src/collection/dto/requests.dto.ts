import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsArray, IsDefined, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { NftJsonValidator } from '../../nft/nft.types';
import { CollectionFilterJsonValidator, CollectionJsonValidator } from '../collection.types';
import sanitizeHtml from 'sanitize-html';

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
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
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
        collectionIds: string[];
}
