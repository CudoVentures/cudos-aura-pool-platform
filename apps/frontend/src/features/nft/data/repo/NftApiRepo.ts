import NftEntity from '../../entities/NftEntity';
import NftRepo from '../../presentation/repos/NftRepo';
import NftFilterModel from '../../utilities/NftFilterModel';
import NftApi from '../data-sources/NftApi';

export default class NftApiRepo implements NftRepo {

    nftApi: NftApi;

    constructor() {
        this.nftApi = new NftApi();
    }

    async fetchNftById(nftId: string): Promise < NftEntity > {
        const nftFilterModel = new NftFilterModel();
        nftFilterModel.from = 0;
        nftFilterModel.count = Number.MAX_SAFE_INTEGER;
        nftFilterModel.nftIds = [nftId];

        const { nftEntities, total } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities.length === 1 ? nftEntities[0] : null;
    }

    async fetchNewNftDrops(): Promise < NftEntity[] > {
        const nftFilterModel = new NftFilterModel();
        // TO DO: sort by newest
        nftFilterModel.from = 0;
        nftFilterModel.count = Number.MAX_SAFE_INTEGER;

        const { nftEntities, total } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities;
    }

    async fetchTrendingNfts(): Promise < NftEntity[] > {
        const nftFilterModel = new NftFilterModel();
        // TO DO: sort by trending
        nftFilterModel.from = 0;
        nftFilterModel.count = Number.MAX_SAFE_INTEGER;

        const { nftEntities, total } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities;
    }

    async fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } > {
        return this.nftApi.fetchNftsByFilter(nftFilterModel);
    }
}
