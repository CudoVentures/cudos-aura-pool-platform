import EnergySourceEntity from '../entities/energy-source.entity';
import ManufacturerEntity from '../entities/manufacturer.entity';
import MinerEntity from '../entities/miner.entity';
import MiningFarmEntity from '../entities/mining-farm.entity';
import { MiningFarmJsonValidator } from '../farm.types';

export class ResCreditMiningFarm {

    miningFarmEntity: MiningFarmJsonValidator;

    constructor(miningFarmEntity: MiningFarmEntity) {
        this.miningFarmEntity = MiningFarmEntity.toJson(miningFarmEntity);
    }

}

export class ResFetchEnergySources {

    energySourceEntities: EnergySourceEntity[];

    constructor(energySourceEntities: EnergySourceEntity[]) {
        this.energySourceEntities = energySourceEntities.map((e) => EnergySourceEntity.toJson(e));
    }

}

export class ResFetchMiners {

    minerEntities: MinerEntity[];

    constructor(minerEntities: MinerEntity[]) {
        this.minerEntities = minerEntities.map((e) => MinerEntity.toJson(e));
    }

}

export class ResFetchManufacturers {

    manufacturerEntities: ManufacturerEntity[];

    constructor(manufacturerEntities: ManufacturerEntity[]) {
        this.manufacturerEntities = manufacturerEntities.map((e) => ManufacturerEntity.toJson(e));
    }

}

export class ResCreditManufacturer {

    manufacturerEntity: ManufacturerEntity;

    constructor(manufacturerEntity: ManufacturerEntity) {
        this.manufacturerEntity = ManufacturerEntity.toJson(manufacturerEntity);
    }

}

export class ResCreditMiner {

    minerEntity: MinerEntity;

    constructor(minerEntity: MinerEntity) {
        this.minerEntity = MinerEntity.toJson(minerEntity);
    }

}

export class ResCreditEnergySource {

    energySourceEntity: EnergySourceEntity;

    constructor(energySourceEntity: EnergySourceEntity) {
        this.energySourceEntity = EnergySourceEntity.toJson(energySourceEntity);
    }

}
