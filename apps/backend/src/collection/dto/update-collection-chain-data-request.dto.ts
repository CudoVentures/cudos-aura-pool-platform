import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export enum ModuleName {
    MARKETPLACE = 'marketplace',
    NFT = 'nft'
}

export class UpdateCollectionChainDataRequestDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'marketplace' })
        module: ModuleName;

    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: ['denom_id1', 'denom_id2'] })
        denomIds: string[];
}
