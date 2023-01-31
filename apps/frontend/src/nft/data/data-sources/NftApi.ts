import BigNumber from 'bignumber.js';
import axios from '../../../core/utilities/AxiosWrapper';
import NftEntity from '../../entities/NftEntity';
import NftFilterModel from '../../utilities/NftFilterModel';
import { ReqBuyNftWithEth, ReqFetchNftsByFilter, ReqUpdateNftCudosPrice } from '../dto/Requests';
import { ResBuyNftWithEth, ResFetchNftsByFilter, ResUpdateNftCudosPrice } from '../dto/Responses';

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

    async updateNftCudosPrice(id: string): Promise< { acudosPrice: BigNumber, ethPrice: BigNumber } > {
        const req = new ReqUpdateNftCudosPrice(id);
        const { data } = await axios.post(`${NftApi.nftModuleUrl}/updatePrice`, req);

        const res = new ResUpdateNftCudosPrice(data);

        return {
            acudosPrice: res.acudosPrice,
            ethPrice: res.ethPrice,
        };
    }

    async buyNftWithEth(id: string, signedTx: any): Promise< string > {
        const req = new ReqBuyNftWithEth(id, signedTx);

        const { data } = await axios.post(`${NftApi.nftModuleUrl}/buyNftWithEth`, req);

        const res = new ResBuyNftWithEth(data);

        return res.txhash;
    }

}
