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
        collection_id: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        status: NftStatus;
}

export type MarketplaceNftFilters = {
    denom_ids: string[];
    tx_hash: string;
};
