import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsEnum, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from 'class-validator';
import { NftFilterJsonValidation, UpdateNftJsonValidations } from '../nft.types';

export class ReqNftsByFilter {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => NftFilterJsonValidation)
        nftFilterJson: NftFilterJsonValidation;
}

export enum ModuleName {
    MARKETPLACE = 'marketplace',
    NFT = 'nft'
}

export class ReqUpdateNftChainData {
    @IsString()
    @IsNotEmpty()
    @IsEnum(ModuleName)
        module: ModuleName;

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => NftFilterJsonValidation)
        nftDataJsons: UpdateNftJsonValidations[];
}
