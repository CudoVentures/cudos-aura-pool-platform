import BigNumber from 'bignumber.js';
import axios from '../../../../core/utilities/AxiosWrapper';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import MiningFarmEarningsEntity from '../../entities/MiningFarmEarningsEntity';
import NftEarningsEntity from '../../entities/NftEarningsEntity';
import NftEventEntity from '../../entities/NftEventEntity';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import UserEarningsEntity from '../../entities/UserEarningsEntity';

export default class StatisticsApi {

    async fetchNftEvents(nftEventFilterModel: NftEventFilterModel): Promise < { nftEventEntities: NftEventEntity[], total: number } > {
        const { data } = await axios.post('/api/v1/statistics/history/nft', { nftEventFilterModel })
        const total = data.total;
        const nftEventEntities = data.nftEventDtos.map((nftEventJson) => NftEventEntity.fromJson(nftEventJson));
        return { nftEventEntities, total };
    }

    async fetchNftEarningsBySessionAccount(timestampFrom: number, timestampTo: number): Promise < UserEarningsEntity > {
        const { data } = await axios.get('/api/v1/statistics/earnings/session-account', { params: { timestampFrom, timestampTo } })

        if (!data.userEarningsDto) {
            return null;
        }

        const userEarningsEntity = UserEarningsEntity.fromJson(data.userEarningsDto);

        return userEarningsEntity
    }

    async fetchNftEarningsByNftId(nftId: string, timestampFrom: number, timestampTo: number): Promise < NftEarningsEntity > {
        const { data } = await axios.get(`/api/v1/statistics/earnings/nft/${nftId}`, { params: { timestampFrom, timestampTo } })

        if (!data.nftEarningsDto) {
            return null;
        }

        const nftEarningsEntity = NftEarningsEntity.fromJson(data.nftEarningsDto);

        return nftEarningsEntity
    }

    async fetchNftEarningsByMiningFarmId(miningFarmId: string, timestampFrom: number, timestampTo: number): Promise < MiningFarmEarningsEntity > {
        const miningFarmEarningsEntity = new MiningFarmEarningsEntity();

        miningFarmEarningsEntity.totalMiningFarmSalesInAcudos = new BigNumber(41253113).multipliedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER);
        miningFarmEarningsEntity.totalNftSold = 41;
        miningFarmEarningsEntity.maintenanceFeeDepositedInBtc = new BigNumber(4.2);
        miningFarmEarningsEntity.earningsPerDayInUsd = [100, 32, 231, 511, 531, 81];

        return miningFarmEarningsEntity;
    }

}
