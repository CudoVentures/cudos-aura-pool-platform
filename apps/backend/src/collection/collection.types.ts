import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsEnum, IsPositive } from 'class-validator';
import { CollectionStatus } from './utils';

export class CollectionJsonValidator {
    @IsString()
        id: string;

    @IsString()
    @IsNotEmpty()
        name: string;

    @IsEnum(CollectionStatus)
    @IsNotEmpty()
        status: CollectionStatus;

    @IsString()
    @IsOptional()
        description: string;

    @IsString()
    @IsOptional()
        denomId: string;

    @IsNumber()
    @IsNotEmpty()
        hashingPower: number;

    @IsNumber()
    @IsNotEmpty()
        royalties: number;

    @IsString()
    @IsNotEmpty()
        mainImage: string;

    @IsString()
    @IsNotEmpty()
        bannerImage: string;

    @IsString()
    @IsNotEmpty()
        farmId: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
        creatorId: string;

    @IsNumber()
        timestampDeletedAt: number;

    @IsNumber()
        timestampUpdatedAt: number;
}

export enum CollectionOrderBy {

    TOP_ASC = 1,
    TOP_DESC = -CollectionOrderBy.TOP_ASC,
    TIMESTAMP_ASC = 2,
    TIMESTAMP_DESC = -CollectionOrderBy.TIMESTAMP_ASC,
}

export class CollectionFilterJsonValidator {
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
        collectionIds: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
        denomIds: string[];

    @IsArray()
    @IsEnum(CollectionStatus, { each: true })
    @IsOptional()
        status: CollectionStatus[];

    @IsString()
    @IsOptional()
        searchString: string;

    @IsString()
        farmId: string;

    @IsNumber()
        timestampFrom: number;
    @IsNumber()
        timestampTo: number;

    @IsEnum(CollectionOrderBy)
        orderBy: CollectionOrderBy;

    @IsNumber()
        from: number;

    @IsNumber()
    @IsPositive()
        count: number;
}
