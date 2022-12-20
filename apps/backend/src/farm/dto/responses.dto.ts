import EnergySourceEntity from '../entities/energy-source.entity';
import ManufacturerEntity from '../entities/manufacturer.entity';
import MinerEntity from '../entities/miner.entity';
import MiningFarmDetailsEntity from '../entities/mining-farm-details.entity';
import MiningFarmEntity from '../entities/mining-farm.entity';
import { EnergySourceJsonValidator, ManufacturerJsonValidator, MinerJsonValidator, MiningFarmDetailsJsonValidator, MiningFarmJsonValidator } from '../farm.types';

export class ResFetchMiningFarmsByFilter {

    miningFarmEntities: MiningFarmJsonValidator[];
    total: number;

    constructor(miningFarmEntities: MiningFarmEntity[], total: number) {
        this.miningFarmEntities = miningFarmEntities.map((e) => MiningFarmEntity.toJson(e));
        this.total = total;
    }

}

export class ResFetchBestPerformingMiningFarms {

    miningFarmEntities: MiningFarmJsonValidator[];

    constructor(miningFarmEntities: MiningFarmEntity[]) {
        this.miningFarmEntities = miningFarmEntities.map((e) => MiningFarmEntity.toJson(e));
    }

}

export class ResCreditMiningFarm {

    miningFarmEntity: MiningFarmJsonValidator;

    constructor(miningFarmEntity: MiningFarmEntity) {
        this.miningFarmEntity = MiningFarmEntity.toJson(miningFarmEntity);
    }

}

export class ResFetchMiningFarmDetails {

    miningFarmDetailsEntities: MiningFarmDetailsJsonValidator[];

    constructor(miningFarmDetailsEntities: MiningFarmDetailsEntity[]) {
        this.miningFarmDetailsEntities = miningFarmDetailsEntities.map((e) => MiningFarmDetailsEntity.toJson(e));
    }

}

export class ResFetchEnergySources {

    energySourceEntities: EnergySourceJsonValidator[];

    constructor(energySourceEntities: EnergySourceEntity[]) {
        this.energySourceEntities = energySourceEntities.map((e) => EnergySourceEntity.toJson(e));
    }

}

export class ResFetchMiners {

    minerEntities: MinerJsonValidator[];

    constructor(minerEntities: MinerEntity[]) {
        this.minerEntities = minerEntities.map((e) => MinerEntity.toJson(e));
    }

}

export class ResFetchManufacturers {

    manufacturerEntities: ManufacturerJsonValidator[];

    constructor(manufacturerEntities: ManufacturerEntity[]) {
        this.manufacturerEntities = manufacturerEntities.map((e) => ManufacturerEntity.toJson(e));
    }

}

export class ResCreditManufacturer {

    manufacturerEntity: ManufacturerJsonValidator;

    constructor(manufacturerEntity: ManufacturerEntity) {
        this.manufacturerEntity = ManufacturerEntity.toJson(manufacturerEntity);
    }

}

export class ResCreditMiner {

    minerEntity: MinerJsonValidator;

    constructor(minerEntity: MinerEntity) {
        this.minerEntity = MinerEntity.toJson(minerEntity);
    }

}

export class ResCreditEnergySource {

    energySourceEntity: EnergySourceJsonValidator;

    constructor(energySourceEntity: EnergySourceEntity) {
        this.energySourceEntity = EnergySourceEntity.toJson(energySourceEntity);
    }

}
