import { Type } from 'class-transformer';
import { IsDefined, IsNotEmptyObject, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { AccountJsonValidator } from '../account.types';

export class ReqCreditSessionAccount {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => AccountJsonValidator)
        accountEntity: AccountJsonValidator;

}

export class ReqEditSessionAccountPass {

    @IsString()
    @IsOptional()
        oldPass: string;

    @IsString()
        newPass: string;

    @IsString()
    @IsOptional()
        token: string;

    isTokenMode(): boolean {
        return this.oldPass === '' && this.token !== '';
    }

    isOldPassMode(): boolean {
        return this.oldPass !== '' && this.token === '';
    }
}

export class ReqForgottenPassword {

    @IsString()
        email: string;

}
