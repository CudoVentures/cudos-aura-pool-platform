import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { AddressMintJsonValidations } from '../../nft/nft.types';

export class ReqLogin {

    @IsString()
        email: string;

    @IsString()
        password: string;

    @IsString()
        cudosWalletAddress: string;

    @IsString()
        walletName: string;

    @IsString()
    @IsOptional()
        pubKeyType: string;

    @IsString()
    @IsOptional()
        pubKeyValue: string;

    @IsString()
    @IsOptional()
        signature: string;
}

export class ReqRegister {

    @IsString()
        email: string;

    @IsString()
        password: string;

    @IsString()
        cudosWalletAddress: string;

    @IsString()
        name: string;

    @IsString()
        pubKeyType: string;

    @IsString()
        pubKeyValue: string;

    @IsString()
        signature: string;

    @IsNumber()
        sequence: number;

    @IsNumber()
        accountNumber: number;

}

export class ReqCreatePresaleAccounts {

    @IsDefined()
    @ValidateNested()
    @IsArray()
    @Type(() => AddressMintJsonValidations)
        addressMintDataEntities: AddressMintJsonValidations[];

}
