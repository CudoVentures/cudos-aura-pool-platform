import AccountEntity from '../../account/entities/account.entity';
import EnergySourceEntity from '../entities/energy-source.entity';
import ManufacturerEntity from '../entities/manufacturer.entity';
import MinerEntity from '../entities/miner.entity';
import MiningFarmDetailsEntity from '../entities/mining-farm-details.entity';
import MiningFarmPerformanceEntity from '../entities/mining-farm-performance.entity';
import MiningFarmEntity from '../entities/mining-farm.entity';
import { EnergySourceJsonValidator, ManufacturerJsonValidator, MinerJsonValidator, MiningFarmDetailsJsonValidator, MiningFarmJsonValidator, MiningFarmPerformanceJsonValidator } from '../farm.types';

export class ResFetchMiningFarmsByFilter {

    miningFarmEntities: MiningFarmJsonValidator[];
    total: number;

    constructor(miningFarmEntities: MiningFarmEntity[], total: number, currentUser: AccountEntity) {
        this.miningFarmEntities = miningFarmEntities.map((e) => MiningFarmEntity.toJson(e, currentUser));
        this.total = total;
    }

}

export class ResFetchBestPerformingMiningFarms {

    miningFarmEntities: MiningFarmJsonValidator[];
    miningFarmPerformanceEntities: MiningFarmPerformanceJsonValidator[];

    constructor(miningFarmEntities: MiningFarmEntity[], miningFarmPerformanceEntities: MiningFarmPerformanceEntity[], currentUser: AccountEntity) {
        this.miningFarmEntities = miningFarmEntities.map((e) => MiningFarmEntity.toJson(e, currentUser));
        this.miningFarmPerformanceEntities = miningFarmPerformanceEntities.map((e) => MiningFarmPerformanceEntity.toJson(e));
    }

}

export class ResCreditMiningFarm {

    miningFarmEntity: MiningFarmJsonValidator;

    constructor(miningFarmEntity: MiningFarmEntity, currentUser: AccountEntity) {
        this.miningFarmEntity = MiningFarmEntity.toJson(miningFarmEntity, currentUser);
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
