import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';

export default class MiningFarmApi {

    async fetchAllMiningFarms(): Promise < MiningFarmEntity[] > {
        return null;
    }

    async fetchPopularMiningFarms(): Promise < MiningFarmEntity[] > {
        return null;
    }

    async fetchMiningFarmsByIds(miningFarmIds: string[]): Promise < MiningFarmEntity[] > {
        return null;
    }

    async fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} > {
        return null;
    }
}
