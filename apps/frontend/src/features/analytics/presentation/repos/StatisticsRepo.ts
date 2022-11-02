import MiningFarmEarningsEntity from '../../entities/MiningFarmEarningsEntity';
import NftEarningsEntity from '../../entities/NftEarningsEntity';
import NftEventEntity from '../../entities/NftEventEntity';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import UserEarningsEntity from '../../entities/UserEarningsEntity';

export default interface StatisticsRepo {

    fetchNftEvents(nftEventFilterModel: NftEventFilterModel): Promise < { nftEventEntities: NftEventEntity[], total: number } >;
    fetchNftEarningsBySessionAccount(timestampFrom: number, timestampTo: number): Promise < UserEarningsEntity >;
    fetchNftEarningsByNftId(nftId: string, timestampFrom: number, timestampTo: number): Promise < NftEarningsEntity >;
    fetchNftEarningsByMiningFarmId(miningFarmId: string, timestampFrom: number, timestampTo: number): Promise < MiningFarmEarningsEntity >;
}
