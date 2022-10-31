import axios from 'axios';
import NftEntity from '../../entities/NftEntity';
import NftFilterModel from '../../utilities/NftFilterModel';

export default class NftApi {

    async fetchNftById(nftId: string): Promise < NftEntity > {
        const { data } = await axios.get(`/api/v1/nft/${nftId}`)

        return data
    }

    async fetchNewNftDrops(): Promise < NftEntity[] > {
        const { data } = await axios.get('/api/v1/nft')

        return data
    }

    async fetchTrendingNfts(): Promise < NftEntity[] > {
        const { data } = await axios.get('/api/v1/nft')

        return data
    }

    async fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } > {
        const { data } = await axios.get('/api/v1/nft', { params: {
            ...nftFilterModel,
        } })

        return data
    }

}
