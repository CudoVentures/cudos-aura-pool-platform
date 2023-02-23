import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { CollectionStatus } from '../collection/utils';
import { IntBoolValue } from '../common/utils';

export enum NftStatus {
    QUEUED = 'queued',
    MINTED = 'minted',
    REMOVED = 'removed',
}

export enum NftGroup {
    GIVEAWAY = 'giveaway',
    PRIVATE_SALE = 'private_sale',
    PRESALE = 'presale',
    PUBLIC_SALE = 'public_sale',
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
        group: NftGroup;

    @IsString()
    @IsOptional()
        tokenId: string;

    @IsNumber()
    @IsNotEmpty()
        hashingPower: number;

    @IsString()
    @IsNotEmpty()
        priceInAcudos: string;

    @IsNumber()
    @IsNotEmpty()
        expirationDateTimestamp: number;

    @IsString()
    @IsNotEmpty()
        collectionId: string;

    @IsString()
        marketplaceNftId: string;

    @IsEnum(NftStatus)
    @IsNotEmpty()
        status: NftStatus;

    @IsString()
        currentOwner: string;

    @IsString()
        creatorId: string;

    @IsNumber()
        priceUsd: number;

    @IsNumber()
        priceAcudosValidUntil: number;

    @IsNumber()
    @IsNotEmpty()
        createdAt: number;

    @IsNumber()
    @IsNotEmpty()
        updatedAt: number;

    @IsNumber()
    @IsNotEmpty()
        deletedAt: number;
}

export enum NftOrderBy {
    TRENDING_ASC = 1,
    TRENDING_DESC = -NftOrderBy.TRENDING_ASC,
    TIMESTAMP_ASC = 2,
    TIMESTAMP_DESC = -NftOrderBy.TIMESTAMP_ASC,
    PRICE_ASC = 3,
    PRICE_DESC = -NftOrderBy.PRICE_ASC,
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

    @IsArray()
    @IsEnum(CollectionStatus, { each: true })
    @IsOptional()
        collectionStatus: CollectionStatus[];

    @IsArray()
    @IsEnum(NftStatus, { each: true })
    @IsOptional()
        nftStatus: NftStatus[];

    @IsArray()
    @IsEnum(NftGroup, { each: true })
    @IsOptional()
        nftGroup: NftGroup[];

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
