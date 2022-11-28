import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { CollectionStatus } from '../utils';

export class UpdateCollectionDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'Collection Name' })
        name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'Collection Name' })
        description: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'Collection Name' })
        denom_id: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ example: 'approved' })
        status: CollectionStatus;
}
