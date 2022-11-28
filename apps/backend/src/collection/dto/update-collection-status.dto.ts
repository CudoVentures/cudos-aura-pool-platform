import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { CollectionStatus } from '../utils';

export class UpdateCollectionStatusDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: CollectionStatus.APPROVED })
        status: CollectionStatus.APPROVED | CollectionStatus.QUEUED;
}
