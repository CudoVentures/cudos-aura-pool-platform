import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsEnum, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
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

    @IsArray()
    @ValidateNested()
    @Type(() => UpdateNftJsonValidations)
        nftDtos: UpdateNftJsonValidations[];

    @IsNumber()
        height: number;
}

export class ReqUpdateNftCudosPrice {
    @IsString()
    @IsNotEmpty()
        id: string;
}
