import NftEntity from '../../entities/NftEntity';
import NftFilterModel from '../../utilities/NftFilterModel';

export default class NftApi {

    async fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } > {
        return null;
    }

}
