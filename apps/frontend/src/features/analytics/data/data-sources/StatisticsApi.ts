import axios from '../../../../core/utilities/AxiosWrapper';
import MegaWalletEventFilterModel from '../../entities/MegaWalletEventFilterModel';
import MiningFarmEarningsEntity from '../../entities/MiningFarmEarningsEntity';
import NftEarningsEntity from '../../entities/NftEarningsEntity';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import TotalEarningsEntity from '../../entities/TotalEarningsEntity';
import UserEarningsEntity from '../../entities/UserEarningsEntity';
import { ReqFetchNftEarningsByMiningFarmId, ReqFetchNftEarningsByNftId, ReqFetchNftEarningsBySessionAccount, ReqFetchTotalNftEarnings, ReqMegaWalletEventEntitiesByFilter, ReqNftEventEntitiesByFilter } from '../dto/Requests';
import { ResFetchNftEarningsByMiningFarmId, ResFetchNftEarningsByNftId, ResFetchNftEarningsBySessionAccount, ResFetchTotalNftEarnings, ResMegaWalletEventEntitiesByFilter, ResNftEventEntitiesByFilter } from '../dto/Responses';

const STATISTICS_URL = '/api/v1/statistics';

export default class StatisticsApi {

    async fetchNftEvents(nftEventFilterModel: NftEventFilterModel): Promise < ResNftEventEntitiesByFilter > {
        const { data } = await axios.post(`${STATISTICS_URL}/events/nft`, new ReqNftEventEntitiesByFilter(nftEventFilterModel));
        const res = new ResNftEventEntitiesByFilter(data);
        return res;
    }

    async fetchMegaWalletEventEntities(megaWalletEventFilterModel: MegaWalletEventFilterModel): Promise < ResMegaWalletEventEntitiesByFilter > {
        const req = new ReqMegaWalletEventEntitiesByFilter(megaWalletEventFilterModel);

        const { data } = await axios.post(`${STATISTICS_URL}/events/mega-wallet`, req);

        const res = new ResMegaWalletEventEntitiesByFilter(data);

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
    }

    async fetchTotalNftEarnings(timestampFrom: number, timestampTo: number): Promise < TotalEarningsEntity > {
        const { data } = await axios.post(`${STATISTICS_URL}/fetchPlatformEarnings`, new ReqFetchTotalNftEarnings(timestampFrom, timestampTo))
        const res = new ResFetchTotalNftEarnings(data);
        return res.totalEarningsEntity;
    }

}
