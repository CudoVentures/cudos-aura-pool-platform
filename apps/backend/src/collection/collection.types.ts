import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsEnum, IsPositive } from 'class-validator';
import { CollectionStatus } from './utils';

export class CollectionJsonValidator {
    @IsString()
    @ApiProperty({ required: true, example: '1' })
        id: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'Collection Name' })
        name: string;

    @IsEnum(CollectionStatus)
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'approved' })
        status: CollectionStatus;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false, example: 'My collection' })
        description: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false, example: 'mydenom' })
        denomId: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 200 })
        hashingPower: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 2 })
        royalties: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'main image' })
        mainImage: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'banner image' })
        bannerImage: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: '1' })
        farmId: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ required: true, example: '1' })
        creatorId: string;

    @IsNumber()
    @ApiProperty({ required: true, example: 2 })
        timestampDeletedAt: number;
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
