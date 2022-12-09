import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { CollectionStatus } from '../collection/utils';
import { IntBoolValue } from '../common/utils';

export enum NftStatus {
    QUEUED = 'queued',
    MINTED = 'minted',
    REMOVED = 'removed',
}

export type MarketplaceNftFilters = {
    denom_ids: string[];
    tx_hash: string;
};

export class NftJsonValidator {
    @IsString()
        id: string;

    @IsString()
        name: string;

    @IsString()
    @IsNotEmpty()
        uri: string;

    @IsString()
    @IsNotEmpty()
        data: string;

    @IsString()
    @IsOptional()
        tokenId: string;

    @IsNumber()
    @IsNotEmpty()
        hashingPower: number;

    @IsString()
    @IsNotEmpty()
        price: string;

    @IsNumber()
    @IsNotEmpty()
        expirationDateTimestamp: number;

    @IsString()
    @IsNotEmpty()
        collectionId: string;

    @IsString()
    @IsNotEmpty()
        marketplaceNftId: string;

    @IsEnum(NftStatus)
    @IsNotEmpty()
        status: NftStatus;

    @IsString()
    @IsNotEmpty()
        currentOwner: string;

    @IsString()
    @IsNotEmpty()
        creatorId: string;
}

export enum NftOrderBy {
    TRENDING_ASC = 1,
    TRENDING_DESC = -NftOrderBy.TRENDING_ASC,
    TIMESTAMP_ASC = 2,
    TIMESTAMP_DESC = -NftOrderBy.TIMESTAMP_ASC,
}

export class NftFilterJsonValidation {
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
        nftIds: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
        tokenIds: string[];

    @IsEnum(CollectionStatus)
        collectionStatus: CollectionStatus;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
        collectionIds: string[];

    @IsString()
    @IsOptional()
        searchString: string;

    @IsEnum(IntBoolValue)
        sessionAccount: number;

    @IsEnum(NftOrderBy)
        orderBy: NftOrderBy;

    @IsNumber()
        from: number;

    @IsNumber()
    @IsPositive()
        count: number;
}

export class UpdateNftJsonValidations {
    @IsString()
    @IsNotEmpty()
        denomId: string;

    @IsString()
    @IsNotEmpty()
        tokenId: string;

}
