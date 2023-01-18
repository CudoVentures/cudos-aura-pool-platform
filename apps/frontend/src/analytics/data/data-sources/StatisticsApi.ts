import axios from '../../../core/utilities/AxiosWrapper';
import EarningsPerDayEntity from '../../entities/EarningsPerDayEntity';
import EarningsPerDayFilterEntity from '../../entities/EarningsPerDayFilterEntity';
import MegaWalletEventFilterModel from '../../entities/MegaWalletEventFilterModel';
import MiningFarmEarningsEntity from '../../entities/MiningFarmEarningsEntity';
import MiningFarmMaintenanceFeeEntity from '../../entities/MiningFarmMaintenanceFeeEntity';
import MiningFarmTotalEarningsBtcEntity from '../../entities/MiningFarmTotalEarningsBtcEntity';
import MiningFarmTotalEarningsCudosEntity from '../../entities/MiningFarmTotalEarningsCudosEntity';
import NftEarningsEntity from '../../entities/NftEarningsEntity';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import PlatformMaintenanceFeeEntity from '../../entities/PlatformMaintenanceFeeEntity';
import PlatformTotalEarningsBtcEntity from '../../entities/PlatformTotalEarningsBtcEntity';
import PlatformTotalEarningsCudosEntity from '../../entities/PlatformTotalEarningsCudosEntity';
import TotalEarningsEntity from '../../entities/TotalEarningsEntity';
import UserEarningsEntity from '../../entities/UserEarningsEntity';
import { ReqFetchEarningsPerDay, ReqFetchMiningFarmMaintenanceFee, ReqFetchMiningFarmTotalEarningsBtc, ReqFetchMiningFarmTotalEarningsCudos, ReqFetchNftEarningsByMiningFarmId, ReqFetchNftEarningsByNftId, ReqFetchNftEarningsBySessionAccount, ReqFetchTotalNftEarnings, ReqMegaWalletEventEntitiesByFilter, ReqNftEventEntitiesByFilter } from '../dto/Requests';
import { ResFetchEarningsPerDay, ResFetchMiningFarmMaintenanceFee, ResFetchMiningFarmTotalEarningsBtc, ResFetchMiningFarmTotalEarningsCudos, ResFetchNftEarningsByMiningFarmId, ResFetchNftEarningsByNftId, ResFetchNftEarningsBySessionAccount, ResFetchPlatformMaintenanceFee, ResFetchPlatformTotalEarningsBtc, ResFetchPlatformTotalEarningsCudos, ResFetchTotalNftEarnings, ResMegaWalletEventEntitiesByFilter, ResNftEventEntitiesByFilter } from '../dto/Responses';

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

    async fetchEarningsPerDay(earningsPerDayFilterEntity: EarningsPerDayFilterEntity): Promise < EarningsPerDayEntity > {
        const req = new ReqFetchEarningsPerDay(earningsPerDayFilterEntity);
        const res = new ResFetchEarningsPerDay({
            'earningsPerDayEntity': {
                'cudosEarningsPerDay': ['1', '2'],
                'btcEarningsPerDay': ['3', '4'],
            },
        })
        return res.earningsPerDayEntity;
    }

    async fetchMiningFarmMaintenanceFee(miningFarmId: string): Promise < MiningFarmMaintenanceFeeEntity > {
        const req = new ReqFetchMiningFarmMaintenanceFee(miningFarmId);
        const res = new ResFetchMiningFarmMaintenanceFee({
            'miningFarmMaintenanceFeeEntity': {
                'maintenanceFeeInBtc': '1',
            },
        });
        return res.miningFarmMaintenanceFeeEntity;
    }

    async fetchMiningFarmTotalEarningsBtc(miningFarmId: string): Promise < MiningFarmTotalEarningsBtcEntity > {
        const req = new ReqFetchMiningFarmTotalEarningsBtc(miningFarmId);
        const res = new ResFetchMiningFarmTotalEarningsBtc({
            'miningFarmTotalEarningsBtcEntity': {
                'unsoftNftsTotalEarningsInBtc': '2',
            },
        });
        return res.miningFarmTotalEarningsBtcEntity;
    }

    async fetchMiningFarmTotalEarningsCudos(miningFarmId: string): Promise < MiningFarmTotalEarningsCudosEntity > {
        const req = new ReqFetchMiningFarmTotalEarningsCudos(miningFarmId);
        const res = new ResFetchMiningFarmTotalEarningsCudos({
            'miningFarmTotalEarningsCudosEntity': {
                'resaleRoyaltiesTotalEarningsInAcudos': '3',
                'soldNftsTotalEarningsInAcudos': '4',
            },
        });
        return res.miningFarmTotalEarningsCudosEntity;
    }

    async fetchPlatformMaintenanceFee(): Promise < PlatformMaintenanceFeeEntity > {
        const res = new ResFetchPlatformMaintenanceFee({
            'platformMaintenanceFeeEntity': {
                'maintenanceFeeInBtc': '5',
            },
        })
        return res.platformMaintenanceFeeEntity;
    }

    async fetchPlatformTotalEarningsBtc(): Promise < PlatformTotalEarningsBtcEntity > {
        const res = new ResFetchPlatformTotalEarningsBtc({
            'platformTotalEarningsBtcEntity': {
                'nftFeesTotalEarningsInBtc': '6',
            },
        })
        return res.platformTotalEarningsBtcEntity;
    }

    async fetchPlatformTotalEarningsCudos(): Promise < PlatformTotalEarningsCudosEntity > {
        const res = new ResFetchPlatformTotalEarningsCudos({
            'platformTotalEarningsCudosEntity': {
                'resaleRoyaltiesTotalEarningsInAcudos': '7',
            },
        })
        return res.platformTotalEarningsCudosEntity;
    }

}
