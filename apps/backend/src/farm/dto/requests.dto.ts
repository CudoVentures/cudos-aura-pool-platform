import { Type } from 'class-transformer';
import { IsDefined, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import { EnergySourceJsonValidator, ManufacturerJsonValidator, MinerJsonValidator, MiningFarmJsonValidator } from '../farm.types';

export class ReqCreditMiningFarm {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => MiningFarmJsonValidator)
        miningFarmEntity: MiningFarmJsonValidator;

}

export class ReqCreditManufacturer {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => ManufacturerJsonValidator)
        manufacturerEntity: ManufacturerJsonValidator;

}

export class ReqCreditMiner {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => MinerJsonValidator)
        minerEntity: MinerJsonValidator;

}

export class ReqCreditEnergySource {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => EnergySourceJsonValidator)
        energySourceEntity: EnergySourceJsonValidator;

}
