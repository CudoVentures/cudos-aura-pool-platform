import { Type } from 'class-transformer';
import { IsDefined, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import { MiningFarmJsonValidator } from '../farm.types';

export class ReqCreditMiningFarm {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => MiningFarmJsonValidator)
        miningFarmEntity: MiningFarmJsonValidator;

}
