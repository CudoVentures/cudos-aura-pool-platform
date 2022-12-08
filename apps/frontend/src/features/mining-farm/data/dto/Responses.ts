import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmEntity from '../../entities/MiningFarmEntity';

export class ResCreditMiningFarm {

    miningFarmEntity: MiningFarmEntity;

    constructor(axiosData: any) {
        this.miningFarmEntity = MiningFarmEntity.fromJson(axiosData.miningFarmEntity);
    }

}

export class ResFetchEnergySources {

    energySourceEntities: EnergySourceEntity[];

    constructor(axiosData: any) {
        this.energySourceEntities = axiosData.energySourceEntities.map((j) => EnergySourceEntity.fromJson(j));
    }

}

export class ResFetchMiners {

    minerEntities: MinerEntity[];

    constructor(axiosData: any) {
        this.minerEntities = axiosData.minerEntities.map((j) => MinerEntity.fromJson(j));
    }

}

export class ResFetchManufacturers {

    manufacturerEntities: ManufacturerEntity[];

    constructor(axiosData: any) {
        this.manufacturerEntities = axiosData.manufacturerEntities.map((j) => ManufacturerEntity.fromJson(j));
    }

}

export class ResCreditManufacturer {

    manufacturerEntity: ManufacturerEntity;

    constructor(axiosData: any) {
        this.manufacturerEntity = ManufacturerEntity.fromJson(axiosData.manufacturerEntity);
    }

}

export class ResCreditMiner {

    minerEntity: MinerEntity;

    constructor(axiosData: any) {
        this.minerEntity = MinerEntity.fromJson(axiosData.minerEntity);
    }

}

export class ResCreditEnergySource {

    energySourceEntity: EnergySourceEntity;

    constructor(axiosData: any) {
        this.energySourceEntity = EnergySourceEntity.fromJson(axiosData.energySourceEntity);
    }

}
