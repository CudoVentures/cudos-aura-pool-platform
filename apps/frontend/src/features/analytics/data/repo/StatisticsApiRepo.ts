import CollectionEventEntity from '../../entities/CollectionEventEntity';
import CollectionEventFilterModel from '../../entities/CollectionEventFilterModel';
import MiningFarmEarningsEntity from '../../entities/MiningFarmEarningsEntity';
import NftEarningsEntity from '../../entities/NftEarningsEntity';
import NftEventEntity from '../../entities/NftEventEntity';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import UserEarningsEntity from '../../entities/UserEarningsEntity';
import StatisticsRepo from '../../presentation/repos/StatisticsRepo';
import StatisticsApi from '../data-sources/StatisticsApi';

export default class StatisticsApiRepo implements StatisticsRepo {

    statisticsApi: StatisticsApi;

    constructor() {
        this.statisticsApi = new StatisticsApi();
    }

    fetchNftEvents(nftEventFilterModel: NftEventFilterModel): Promise < { nftEventEntities: NftEventEntity[], total: number } > {
        return this.statisticsApi.fetchNftEvents(nftEventFilterModel);
    }

    fetchNftEarningsBySessionAccount(timestampFrom: number, timestampTo: number): Promise < UserEarningsEntity > {
        return this.statisticsApi.fetchNftEarningsBySessionAccount(timestampFrom, timestampTo);
    }

    fetchNftEarningsByNftId(nftId: string, timestampFrom: number, timestampTo: number): Promise < NftEarningsEntity > {
        return this.statisticsApi.fetchNftEarningsByNftId(nftId, timestampFrom, timestampTo);
    }

    fetchNftEarningsByMiningFarmId(miningFarmId: string, timestampFrom: number, timestampTo: number): Promise < MiningFarmEarningsEntity > {
        return this.statisticsApi.fetchNftEarningsByMiningFarmId(miningFarmId, timestampFrom, timestampTo);
    }

}
