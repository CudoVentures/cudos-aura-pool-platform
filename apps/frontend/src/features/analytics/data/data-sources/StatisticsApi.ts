import axios from '../../../../core/utilities/AxiosWrapper';
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

    fetchNftEarningsByMiningFarmId(miningFarmId: string, timestampFrom: number, timestampTo: number): Promise < MiningFarmEarningsEntity > {
        return null;
    }

}
