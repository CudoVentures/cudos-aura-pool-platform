import { IsEnum, IsNumber, IsString } from 'class-validator';
import { IntBoolValue } from '../common/utils';

export enum AccountType {
    USER = 1,
    ADMIN = 2,
    SUPER_ADMIN = 3,
}

export class AccountJsonValidator {

    @IsString()
        accountId: string;

    @IsEnum(AccountType)
        type: AccountType;

    @IsEnum(IntBoolValue)
        active: IntBoolValue;

    @IsEnum(IntBoolValue)
        emailVerified: IntBoolValue;

    @IsString()
        name: string;

    @IsString()
        email: string;

    @IsNumber()
        timestampLastLogin: number;

    @IsNumber()
        timestampRegister: number;

}

export class SuperAdminJsonValidator {
    @IsString()
        superAdminId: string;

    @IsString()
        accountId: string;

    @IsString()
        cudosRoyalteesAddress: string;

    @IsNumber()
        firstSaleCudosRoyaltiesPercent: number;

    @IsNumber()
        resaleCudosRoyaltiesPercent: number;

    @IsNumber()
        globalCudosFeesPercent: number;

    @IsNumber()
        globalCudosRoyaltiesPercent: number;

}
