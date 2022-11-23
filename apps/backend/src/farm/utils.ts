import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export const enum FarmStatus {
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum FarmStatusWithAny {
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    ANY = 'any',
}

export const enum FarmOrderBy {
    POPULAR_DESC = 1,
}

export class FarmFilters {
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        ids: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        creator_id: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        status: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        search_string: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        order_by: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        limit: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        offset: number;
}
