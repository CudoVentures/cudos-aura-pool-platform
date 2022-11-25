import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export enum ModuleName {
    MARKETPLACE = 'marketplace',
    NFT = 'nft'
}

export class UpdateNftChainDataRequestDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'marketplace' })
        module: ModuleName;

    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: ['1', '2'] })
        tokenIds: string[];
}
