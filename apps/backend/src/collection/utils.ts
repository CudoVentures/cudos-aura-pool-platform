import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export const enum CollectionStatus {
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    ISSUED = 'issued',
    DELETED = 'deleted',
}

export enum CollectionStatusWithAny {
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    ISSUED = 'issued',
    DELETED = 'deleted',
    ANY = 'any',
}

export const enum CollectionOrderBy {
    TIMESTAMP_DESC = 1,
}

// TODO: add search string field
export class CollectionFilters {
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        ids: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        denom_id: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        search_string: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        creator_id: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        farm_id: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        status: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        from_timestamp: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        to_timestamp: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        order_by: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        offset: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        limit: number;
}

export type MarketplaceCollectionFilters = {
    denom_id: string;
};
