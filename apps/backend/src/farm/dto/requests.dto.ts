import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsNotEmptyObject, IsObject, IsString, ValidateNested } from 'class-validator';
import { EnergySourceJsonValidator, ManufacturerJsonValidator, MinerJsonValidator, MiningFarmJsonValidator } from '../farm.types';

export class ReqCreditMiningFarm {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => MiningFarmJsonValidator)
        miningFarmEntity: MiningFarmJsonValidator;

}

export class ReqFetchMiningFarmDetails {

    @IsArray()
    @IsString({ each: true })
        miningFarmIds: string[];

    getParsedIds(): number[] {
        return this.miningFarmIds.map((s) => parseInt(s));
    }

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
