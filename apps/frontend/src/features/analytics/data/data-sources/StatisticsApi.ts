import axios from '../../../../core/utilities/AxiosWrapper';
import MiningFarmEarningsEntity from '../../entities/MiningFarmEarningsEntity';
import NftEarningsEntity from '../../entities/NftEarningsEntity';
import NftEventEntity from '../../entities/NftEventEntity';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import UserEarningsEntity from '../../entities/UserEarningsEntity';

export default class StatisticsApi {

    async fetchNftEvents(nftEventFilterModel: NftEventFilterModel): Promise < { nftEventEntities: NftEventEntity[], total: number } > {
        const { data } = await axios.get(`/api/v1/statistics/hostory/nft/${nftEventFilterModel.nftId}`, { params: { ...nftEventFilterModel } })

        return data
    }

    async fetchNftEarningsBySessionAccount(timestampFrom: number, timestampTo: number): Promise < UserEarningsEntity > {
        const { data } = await axios.get(`/api/v1/statistics/earnings/address/${cudosAddress}`, { params: { timestampFrom, timestampTo } })

        return data
    }

    async fetchNftEarningsByNftId(nftId: string, timestampFrom: number, timestampTo: number): Promise < NftEarningsEntity > {
        const { data } = await axios.get(`/api/v1/statistics/earnings/nft/${nftId}`, { params: { timestampFrom, timestampTo } })

        return data
    }

    fetchNftEarningsByMiningFarmId(miningFarmId: string, timestampFrom: number, timestampTo: number): Promise < MiningFarmEarningsEntity > {
        return null;
    }

}
