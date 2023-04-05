import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsDefined, IsEmail, IsNotEmptyObject, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { AccountJsonValidator, SuperAdminJsonValidator, UserJsonValidator } from '../account.types';
import sanitizeHtml from 'sanitize-html';

export class ReqEditSessionAccount {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => AccountJsonValidator)
        accountEntity: AccountJsonValidator;

}

export class ReqEditSessionUser {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => UserJsonValidator)
        userEntity: UserJsonValidator;

}

export class ReqEditSessionSuperAdmin {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => SuperAdminJsonValidator)
        superAdminEntity: SuperAdminJsonValidator;

}

export class ReqEditSessionAccountPass {

    @IsString()
    @IsOptional()
        oldPass: string;

    @IsString()
        newPass: string;

    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
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
    @IsEmail()
        email: string;
}
