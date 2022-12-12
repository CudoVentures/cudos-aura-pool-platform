import axios from '../../../../core/utilities/AxiosWrapper';
import NftEntity from '../../entities/NftEntity';
import NftFilterModel from '../../utilities/NftFilterModel';
import { ReqFetchNftsByFilter } from '../dto/Requests';
import { ResFetchNftsByFilter } from '../dto/Responses';

export default class NftApi {

    async fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } > {
        const req = new ReqFetchNftsByFilter(nftFilterModel);

        const { data } = await axios.post('/api/v1/nft', req);

        const res = new ResFetchNftsByFilter(data);

        return {
            nftEntities: res.nftEntities,
            total: res.total,
        }
    }

}
