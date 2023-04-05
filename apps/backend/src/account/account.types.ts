import { IsEnum, IsNumber, IsString } from 'class-validator';
import { IntBoolValue } from '../common/utils';
import sanitizeHtml from 'sanitize-html';
import { Transform, TransformFnParams } from 'class-transformer';

export enum AccountType {
    USER = 1,
    ADMIN = 2,
    SUPER_ADMIN = 3,
}

export class AccountJsonValidator {
    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        accountId: string;

    @IsEnum(AccountType)
        type: AccountType;

    @IsEnum(IntBoolValue)
        active: IntBoolValue;

    @IsEnum(IntBoolValue)
        emailVerified: IntBoolValue;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        name: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        email: string;

    @IsNumber()
        timestampLastLogin: number;

    @IsNumber()
        timestampRegister: number;

}

export class UserJsonValidator {

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        userId: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        accountId: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        cudosWalletAddress: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        bitcoinPayoutWalletAddress: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        profileImgUrl: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        coverImgUrl: string;

}

export class SuperAdminJsonValidator {
    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        superAdminId: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        accountId: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
        cudosRoyalteesAddress: string;

}
