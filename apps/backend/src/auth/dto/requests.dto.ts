import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsArray, IsDefined, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { AddressMintJsonValidations } from '../../nft/nft.types';
import sanitizeHtml from 'sanitize-html';

export class ReqLogin {

    // no is email check since it can be empty
    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        email: string;

    @IsString()
        password: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        cudosWalletAddress: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        walletName: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsOptional()
        pubKeyType: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsOptional()
        pubKeyValue: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsOptional()
        signature: string;
}

export class ReqRegister {
    // no is email check since it can be empty
    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        email: string;

    @IsString()
        password: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        cudosWalletAddress: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        name: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        pubKeyType: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        pubKeyValue: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
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
