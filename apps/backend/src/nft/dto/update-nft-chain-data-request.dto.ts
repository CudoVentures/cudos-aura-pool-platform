import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export enum ModuleName {
    MARKETPLACE = 'marketplace',
    NFT = 'nft'
}

class UpdateNftDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'denomid' })
        denomId: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: '2' })
        tokenId: string;

}

export class UpdateNftChainDataRequestDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: 'marketplace' })
        module: ModuleName;

    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ required: true, example: [{ denomId: 'denomId', tokenId: '2' }] })
        nftDtos: UpdateNftDto[];
}
