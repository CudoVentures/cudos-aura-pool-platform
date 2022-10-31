import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';

export default interface MiningFarmRepo {

    fetchAllMiningFarms(status?: MiningFarmStatus): Promise < MiningFarmEntity[] >;
    fetchPopularMiningFarms(status?: MiningFarmStatus): Promise < MiningFarmEntity[] >;
    fetchMiningFarmsByIds(miningFarmIds: string[], status?: MiningFarmStatus): Promise < MiningFarmEntity[] >;
    fetchMiningFarmById(miningFarmId: string, status?: MiningFarmStatus): Promise < MiningFarmEntity >;
    fetchMiningFarmBySessionAccountId(status?: MiningFarmStatus): Promise < MiningFarmEntity >;
    fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel, status?: MiningFarmStatus): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} >;
    creditMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < void >;
    creditMiningFarms(miningFarmEntities: MiningFarmEntity[]): Promise < void >;
    fetchMiningFarmSalesStatistics(miningFarmId: string, timestamp: number): Promise < number[] >;
}
