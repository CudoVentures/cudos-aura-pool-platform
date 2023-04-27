import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { CollectionStatus } from '../collection/utils';
import { IntBoolValue } from '../common/utils';
import { Transform, TransformFnParams } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

export enum NftStatus {
    QUEUED = 'queued',
    MINTED = 'minted',
    REMOVED = 'removed',
}

export enum NftGroup {
    GIVEAWAY = 'giveaway',
    PRIVATE_SALE = 'private_sale',
    PRESALE = 'presale',
    PUBLIC_SALE = '',
}

export type MarketplaceNftFilters = {
    denom_ids: string[];
    tx_hash: string;
};

export class NftJsonValidator {
    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        id: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        name: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        artistName: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsNotEmpty()
        uri: string;

    @IsEnum(NftGroup)
        group: NftGroup;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsOptional()
        tokenId: string;

    @IsNumber()
    @Min(0)
        hashingPower: number;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsNotEmpty()
        priceInAcudos: string;

    @IsNumber()
    @Min(0)
        expirationDateTimestamp: number;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsNotEmpty()
        collectionId: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        marketplaceNftId: string;

    @IsEnum(NftStatus)
    @IsNotEmpty()
        status: NftStatus;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        currentOwner: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        creatorId: string;

    @IsNumber()
    @Min(0)
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
    HASH_RATE_ASC = 4,
    HASH_RATE_DESC = -NftOrderBy.HASH_RATE_ASC,
    EXPIRY_ASC = 5,
    EXPIRY_DESC = -NftOrderBy.EXPIRY_ASC,
}

export enum NftPriceType {
    USD = 1,
    CUDOS = 2,
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
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
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

    @IsNumber()
        hashRateMin: number;

    @IsNumber()
    @Min(0)
        hashRateMax: number;

    @IsEnum(NftPriceType)
        priceFilterType: NftPriceType;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsNotEmpty()
        priceMin: string;
    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsNotEmpty()
        priceMax: string;

    @IsNumber()
        expiryMin: number;

    @IsNumber()
        expiryMax: number;
}

export class UpdateNftJsonValidations {
    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsNotEmpty()
        denomId: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsNotEmpty()
        tokenId: string;

}

export class AddressMintJsonValidations {

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        cudosAddress: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        firstName: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        lastName: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        applicantId: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        workflowRunId: string;

}

export enum PurchaseTransactionStatus {
    PENDING = '1',
    SUCCESS = '2',
    REFUNDED = '3',
}

export class PurchaseTransactionJsonValidations {
    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsNotEmpty()
        txhash: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        recipientAddress: string;

    @IsNumber()
        timestamp: number;

    @IsEnum(PurchaseTransactionStatus)
        status: PurchaseTransactionStatus;
}

export class PurchaseTransactionsFilterJsonValidation {
    @IsNumber()
        from: number;

    @IsNumber()
    @IsPositive()
        count: number;
}
