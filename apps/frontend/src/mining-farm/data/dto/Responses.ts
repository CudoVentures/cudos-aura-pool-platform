import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmPerformanceEntity from '../../entities/MiningFarmPerformanceEntity';

export class ResFetchBestPerformingMiningFarms {

    miningFarmEntities: MiningFarmEntity[];
    miningFarmPerformanceEntities: MiningFarmPerformanceEntity[];

    constructor(axiosData: any) {
        this.miningFarmEntities = axiosData.miningFarmEntities.map((e) => MiningFarmEntity.fromJson(e));
        this.miningFarmPerformanceEntities = axiosData.miningFarmPerformanceEntities.map((e) => MiningFarmPerformanceEntity.fromJson(e));
    }

}

export class ResCreditMiningFarm {

    miningFarmEntity: MiningFarmEntity;

    constructor(axiosData: any) {
        this.miningFarmEntity = MiningFarmEntity.fromJson(axiosData.miningFarmEntity);
    }

}

export class ResFetchMiningFarmDetails {

    miningFarmDetailsEntities: MiningFarmDetailsEntity[];

    constructor(axiosData: any) {
        this.miningFarmDetailsEntities = axiosData.miningFarmDetailsEntities.map((j) => MiningFarmDetailsEntity.fromJson(j));
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
