import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmEntity from '../../entities/MiningFarmEntity';

export class ReqCreditMiningFarm {

    miningFarmEntity: MiningFarmEntity;

    constructor(miningFarmEntity: MiningFarmEntity) {
        this.miningFarmEntity = MiningFarmEntity.toJson(miningFarmEntity);
    }

}

export class ReqCreditManufacturer {

    manufacturerEntity: ManufacturerEntity;

    constructor(manufacturerEntity: ManufacturerEntity) {
        this.manufacturerEntity = ManufacturerEntity.toJson(manufacturerEntity);
    }

}

export class ReqCreditMiner {

    minerEntity: MinerEntity;

    constructor(minerEntity: MinerEntity) {
        this.minerEntity = MinerEntity.toJson(minerEntity);
    }

}

export class ReqCreditEnergySource {

    energySourceEntity: EnergySourceEntity;

    constructor(energySourceEntity: EnergySourceEntity) {
        this.energySourceEntity = EnergySourceEntity.toJson(energySourceEntity);
    }

}
