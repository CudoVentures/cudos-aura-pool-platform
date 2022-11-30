import { Type } from 'class-transformer';
import { IsDefined, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import { AccountJsonValidator } from '../account.types';

export class ReqCreditSessionAccount {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => AccountJsonValidator)
        accountEntity: AccountJsonValidator;

}
