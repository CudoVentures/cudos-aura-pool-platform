import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export const enum CollectionStatus {
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    ISSUED = 'issued',
    DELETED = 'deleted',
}

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
        offset: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        limit: number;
}

export type MarketplaceCollectionFilters = {
    denom_id: string;
};
