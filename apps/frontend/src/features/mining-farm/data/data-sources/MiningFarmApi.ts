import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';

export default class MiningFarmApi {

    async fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} > {
        return null;
    }

    async creditMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < MiningFarmEntity > {
        return null;
    }

    async fetchMiningFarmSalesStatistics(miningFarmId: string, timestamp: number): Promise < number[] > {
        return null;
    }
}
