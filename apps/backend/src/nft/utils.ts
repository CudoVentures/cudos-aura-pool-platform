import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export const enum NftStatus {
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    EXPIRED = 'expired',
    DELETED = 'deleted',
    MINTED = 'minted',
}

export enum NftOrderBy {
    TRENDING_DESC = 1,
    TIMESTAMP_DESC = 2
}

export class NftFilters {
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        ids: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        creator_id: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        collection_ids: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        order_by: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        status: NftStatus;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        search_string: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        limit: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        offset: number;
}

export type MarketplaceNftFilters = {
    denom_ids: string[];
    tx_hash: string;
};
