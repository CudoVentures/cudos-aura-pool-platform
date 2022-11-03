import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';

export default class MiningFarmApi {

    async fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} > {
        return null;
    }

    async creditMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < MiningFarmEntity > {
        return null;
    }

    async fetchManufacturers(): Promise < ManufacturerEntity[] > {
        return null;
    }
    async fetchMiners(): Promise < MinerEntity[] > {
        return null;
    }

    async fetchEnergySources(): Promise < EnergySourceEntity[] > {
        return null;
    }

    async creditManufacturer(manufacturerEntity: ManufacturerEntity): Promise < void > {
        return null;
    }

    async creditMiner(minerEntity: MinerEntity): Promise < void > {
        return null;
    }

    async creditEnergySource(energySourceEntity: EnergySourceEntity): Promise < void > {
        return null;
    }

}
