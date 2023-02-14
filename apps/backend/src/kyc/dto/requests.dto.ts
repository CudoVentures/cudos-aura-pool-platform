import { Type } from 'class-transformer';
import { IsDefined, IsEnum, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import { IntBoolValue } from '../../common/utils';
import { KycJsonValidator } from '../kyc.types';

export class ReqCreditKyc {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => KycJsonValidator)
        kycEntity: KycJsonValidator;

}

export class ReqCreateWorkflowRun {

    @IsEnum(IntBoolValue)
        runFullWorkflow: IntBoolValue;

}
