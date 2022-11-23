import axios from '../../../../core/utilities/AxiosWrapper';
import NftEntity from '../../entities/NftEntity';
import NftFilterModel from '../../utilities/NftFilterModel';

export default class NftApi {

    async fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } > {
        const { data } = await axios.post('/api/v1/nft', NftFilterModel.toJson(nftFilterModel))

        return {
            nftEntities: data.nftEntities.map((json) => NftEntity.fromJson(json)),
            total: data.total,
        }
    }

}
