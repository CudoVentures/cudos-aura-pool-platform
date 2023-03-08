import axios from '../../../core/utilities/AxiosWrapper';
import EarningsPerDayEntity from '../../entities/EarningsPerDayEntity';
import EarningsPerDayFilterEntity from '../../entities/EarningsPerDayFilterEntity';
import MegaWalletEventFilterModel from '../../entities/MegaWalletEventFilterModel';
import MiningFarmMaintenanceFeeEntity from '../../entities/MiningFarmMaintenanceFeeEntity';
import MiningFarmTotalEarningsBtcEntity from '../../entities/MiningFarmTotalEarningsBtcEntity';
import MiningFarmTotalEarningsCudosEntity from '../../entities/MiningFarmTotalEarningsCudosEntity';
import NftEarningsEntity from '../../entities/NftEarningsEntity';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import PlatformMaintenanceFeeEntity from '../../entities/PlatformMaintenanceFeeEntity';
import PlatformTotalEarningsBtcEntity from '../../entities/PlatformTotalEarningsBtcEntity';
import PlatformTotalEarningsCudosEntity from '../../entities/PlatformTotalEarningsCudosEntity';
import UserEarningsEntity from '../../entities/UserEarningsEntity';
import { ReqFetchEarningsPerDay, ReqFetchMiningFarmMaintenanceFee, ReqFetchMiningFarmTotalEarningsBtc, ReqFetchMiningFarmTotalEarningsCudos, ReqFetchNftEarningsByNftId, ReqFetchNftEarningsBySessionAccount, ReqMegaWalletEventEntitiesByFilter, ReqNftEventEntitiesByFilter } from '../dto/Requests';
import { ResFetchEarningsPerDay, ResFetchMiningFarmMaintenanceFee, ResFetchMiningFarmTotalEarningsBtc, ResFetchMiningFarmTotalEarningsCudos, ResFetchNftEarningsByNftId, ResFetchNftEarningsBySessionAccount, ResFetchPlatformMaintenanceFee, ResFetchPlatformTotalEarningsBtc, ResFetchPlatformTotalEarningsCudos, ResMegaWalletEventEntitiesByFilter, ResNftEventEntitiesByFilter } from '../dto/Responses';

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

    async fetchEarningsPerDay(earningsPerDayFilterEntity: EarningsPerDayFilterEntity): Promise < EarningsPerDayEntity > {
        const req = new ReqFetchEarningsPerDay(earningsPerDayFilterEntity);

        const { data } = await axios.post(`${STATISTICS_URL}/fetchEarningsPerDay`, req)

        const res = new ResFetchEarningsPerDay(data)

        return res.earningsPerDayEntity;
    }

    async fetchMiningFarmMaintenanceFee(miningFarmId: string, collectionId: string): Promise < MiningFarmMaintenanceFeeEntity > {
        const req = new ReqFetchMiningFarmMaintenanceFee(miningFarmId, collectionId);

        const { data } = await axios.post(`${STATISTICS_URL}/fetchFarmMaintenanceFee`, req)

        const res = new ResFetchMiningFarmMaintenanceFee(data);

        return res.miningFarmMaintenanceFeeEntity;
    }

    async fetchMiningFarmTotalEarningsBtc(miningFarmId: string, collectionId: string): Promise < MiningFarmTotalEarningsBtcEntity > {
        const req = new ReqFetchMiningFarmTotalEarningsBtc(miningFarmId, collectionId);

        const { data } = await axios.post(`${STATISTICS_URL}/fetchFarmTotalBtcEarnings`, req)

        const res = new ResFetchMiningFarmTotalEarningsBtc(data);

        return res.miningFarmTotalEarningsBtcEntity;
    }

    async fetchMiningFarmTotalEarningsCudos(miningFarmId: string, collectionId: string): Promise < MiningFarmTotalEarningsCudosEntity > {
        const req = new ReqFetchMiningFarmTotalEarningsCudos(miningFarmId, collectionId);

        const { data } = await axios.post(`${STATISTICS_URL}/fetchFarmTotalCudosEarnings`, req)

        const res = new ResFetchMiningFarmTotalEarningsCudos(data);

        return res.miningFarmTotalEarningsCudosEntity;
    }

    async fetchPlatformMaintenanceFee(): Promise < PlatformMaintenanceFeeEntity > {
        const { data } = await axios.post(`${STATISTICS_URL}/fetchPlatformMaintenanceFees`)

        const res = new ResFetchPlatformMaintenanceFee(data)

        return res.platformMaintenanceFeeEntity;
    }

    async fetchPlatformTotalEarningsBtc(): Promise < PlatformTotalEarningsBtcEntity > {
        const { data } = await axios.post(`${STATISTICS_URL}/fetchPlatformTotalBtcEarnings`)

        const res = new ResFetchPlatformTotalEarningsBtc(data)

        return res.platformTotalEarningsBtcEntity;
    }

    async fetchPlatformTotalEarningsCudos(): Promise < PlatformTotalEarningsCudosEntity > {
        const { data } = await axios.post(`${STATISTICS_URL}/fetchPlatformTotalCudosEarnings`)

        const res = new ResFetchPlatformTotalEarningsCudos(data);

        return res.platformTotalEarningsCudosEntity;
    }

}
