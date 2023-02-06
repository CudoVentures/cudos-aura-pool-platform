import { Type } from 'class-transformer';
import { IsDefined, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import { KycJsonValidator } from '../kyc.types';

export class ReqCreditKyc {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => KycJsonValidator)
        kycEntity: KycJsonValidator;

}
