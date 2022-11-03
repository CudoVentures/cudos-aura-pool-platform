import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';

export default interface MiningFarmRepo {

    fetchAllMiningFarms(): Promise < MiningFarmEntity[] >;
    fetchPopularMiningFarms(): Promise < MiningFarmEntity[] >;
    fetchMiningFarmsByIds(miningFarmIds: string[]): Promise < MiningFarmEntity[] >;
    fetchMiningFarmById(miningFarmId: string): Promise < MiningFarmEntity >;
    fetchMiningFarmBySessionAccountId(): Promise < MiningFarmEntity >;
    fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} >;
    creditMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < void >;
    creditMiningFarms(miningFarmEntities: MiningFarmEntity[]): Promise < void >;
    fetchMiningFarmSalesStatistics(miningFarmId: string, timestamp: number): Promise < number[] >;
    approveMiningFarms(miningFarmEntities: MiningFarmEntity[]): Promise < void >;
}
