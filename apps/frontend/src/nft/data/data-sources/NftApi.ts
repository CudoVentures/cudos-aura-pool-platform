import axios from '../../../core/utilities/AxiosWrapper';
import NftEntity from '../../entities/NftEntity';
import NftFilterModel from '../../utilities/NftFilterModel';
import { ReqFetchNftsByFilter, ReqUpdateNftCudosPrice } from '../dto/Requests';
import { ResFetchNftsByFilter, ResUpdateNftCudosPrice } from '../dto/Responses';

export default class NftApi {

    static nftModuleUrl = '/api/v1/nft';

    async fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } > {
        const req = new ReqFetchNftsByFilter(nftFilterModel);

        const { data } = await axios.post(NftApi.nftModuleUrl, req);

        const res = new ResFetchNftsByFilter(data);

        return {
            nftEntities: res.nftEntities,
            total: res.total,
        }
    }

    async updateNftCudosPrice(id: string): Promise < NftEntity > {
        const req = new ReqUpdateNftCudosPrice(id);
        const { data } = await axios.post(`${NftApi.nftModuleUrl}/updatePrice`, req);

        const res = new ResUpdateNftCudosPrice(data);

        return res.nftEntity;
    }

}
