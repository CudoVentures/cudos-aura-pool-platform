import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsEnum, IsPositive, Min } from 'class-validator';
import { CollectionStatus } from './utils';
import { Transform, TransformFnParams } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

export class CollectionJsonValidator {
    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        id: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsNotEmpty()
        name: string;

    @IsEnum(CollectionStatus)
    @IsNotEmpty()
        status: CollectionStatus;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsOptional()
        description: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsOptional()
        denomId: string;

    @IsNumber()
    @Min(0)
    @IsNotEmpty()
        hashingPower: number;

    @IsNumber()
    @Min(0)
    @IsNotEmpty()
        royalties: number;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsNotEmpty()
        mainImage: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsNotEmpty()
        bannerImage: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsNotEmpty()
        farmId: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
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
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsOptional()
        searchString: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
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
