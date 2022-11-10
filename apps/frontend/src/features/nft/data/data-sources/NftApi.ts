import axios from '../../../../core/utilities/AxiosWrapper';
import NftEntity from '../../entities/NftEntity';
import NftFilterModel from '../../utilities/NftFilterModel';

export default class NftApi {

    async fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } > {
        const { data } = await axios.get('/api/v1/nft', { params: {
            ...(nftFilterModel.nftIds && { ids: nftFilterModel.nftIds.join(',') }),
            ...(nftFilterModel.collectionIds && { collection_ids: nftFilterModel.collectionIds.join(',') }),
        } })

        const nfts = data.map((nftJson) => NftEntity.fromJson(nftJson))

        return {
            nftEntities: nfts,
            total: nfts.length,
        }
    }

}
