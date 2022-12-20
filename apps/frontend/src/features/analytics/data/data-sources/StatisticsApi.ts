import axios from '../../../../core/utilities/AxiosWrapper';
import MiningFarmEarningsEntity from '../../entities/MiningFarmEarningsEntity';
import NftEarningsEntity from '../../entities/NftEarningsEntity';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import TotalEarningsEntity from '../../entities/TotalEarningsEntity';
import UserEarningsEntity from '../../entities/UserEarningsEntity';
import { ReqFetchNftEarningsByMiningFarmId, ReqFetchNftEarningsByNftId, ReqFetchNftEarningsBySessionAccount, ReqFetchTotalNftEarnings, ReqNftEventEntitiesByFilter } from '../dto/Requests';
import { ResFetchNftEarningsByMiningFarmId, ResFetchNftEarningsByNftId, ResFetchNftEarningsBySessionAccount, ResFetchTotalNftEarnings, ResNftEventEntitiesByFilter } from '../dto/Responses';

const STATISTICS_URL = '/api/v1/statistics';

export default class StatisticsApi {

    async fetchNftEvents(nftEventFilterModel: NftEventFilterModel): Promise < ResNftEventEntitiesByFilter > {
        const req = new ReqNftEventEntitiesByFilter(nftEventFilterModel);

        const { data } = await axios.post(`${STATISTICS_URL}/events/nft`, req);

        const res = new ResNftEventEntitiesByFilter(data);

        return res;
    }

    async fetchNftEarningsBySessionAccount(timestampFrom: number, timestampTo: number): Promise < UserEarningsEntity > {
        const { data } = await axios.post(`${STATISTICS_URL}/fetchNftEarningsBySessionAccount`, new ReqFetchNftEarningsBySessionAccount(timestampFrom, timestampTo))
        const res = new ResFetchNftEarningsBySessionAccount(data);
        return res.userEarningsEntity;
    }

    async fetchNftEarningsByNftId(nftId: string, timestampFrom: number, timestampTo: number): Promise < NftEarningsEntity > {
        const { data } = await axios.post(`${STATISTICS_URL}/fetchNftEarningsByNftId`, new ReqFetchNftEarningsByNftId(nftId, timestampFrom, timestampTo))
        const res = new ResFetchNftEarningsByNftId(data);
        return res.nftEarningsEntity;
    }

    async fetchNftEarningsByMiningFarmId(miningFarmId: string, timestampFrom: number, timestampTo: number): Promise < MiningFarmEarningsEntity > {
        const { data } = await axios.post(`${STATISTICS_URL}/fetchNftEarningsByMiningFarmId`, new ReqFetchNftEarningsByMiningFarmId(miningFarmId, timestampFrom, timestampTo))
        const res = new ResFetchNftEarningsByMiningFarmId(data);
        return res.miningFarmEarningsEntity;
        // const miningFarmEarningsEntity = new MiningFarmEarningsEntity();

        // miningFarmEarningsEntity.totalMiningFarmSalesInAcudos = new BigNumber(41253113).multipliedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER);
        // miningFarmEarningsEntity.totalNftSold = 41;
        // miningFarmEarningsEntity.maintenanceFeeDepositedInBtc = new BigNumber(4.2);
        // miningFarmEarningsEntity.earningsPerDayInUsd = [100, 32, 231, 511, 531, 81];

        // return miningFarmEarningsEntity;
    }

    async fetchTotalNftEarnings(timestampFrom: number, timestampTo: number): Promise < TotalEarningsEntity > {

        const { data } = await axios.post(`${STATISTICS_URL}/earnings/total`, new ReqFetchTotalNftEarnings(timestampFrom, timestampTo))
        const res = new ResFetchTotalNftEarnings(data);

        return res.totalEarningsEntity;
    }

}
