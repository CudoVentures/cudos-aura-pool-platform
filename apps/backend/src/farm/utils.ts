import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export const enum FarmStatus {
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export class FarmFilters {

    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false })
        creator_id: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
        status: FarmStatus;
}
