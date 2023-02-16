import axios from 'axios';
import Config from '../../config/Config';
import NftEntity from '../entities/NftEntity';
import CudosAuraPoolServiceRepo from '../workers/repos/CudosAuraPoolServiceRepo';
import { ReqUpdateLastCheckedBlocks, ReqUpdateNftPrice } from './dto/Requests';
import { ResFetchLastCheckedBlocks, ResFetchRandomNftForPresaleMint } from './dto/Responses';

const HEARTBEAT_ENDPOINT = '/api/v1/general/heartbeat';
const LAST_BLOCK_ENDPOINT = '/api/v1/general/last-checked-payment-relayer-blocks';
const FETCH_RANDOM_NFT_FOR_PRESALE_MINT = '/api/v1/nft/get-random-presale-mint';
const UPDATE_NFT_PRICE = '/api/v1/nft/updatePrice';

export default class CudosAuraPoolServiceApiRepo implements CudosAuraPoolServiceRepo {
    api_url: string;

    constructor() {
        this.api_url = Config.AURA_POOL_API;
    }

    async fetchHeartbeat(): Promise< void > {
        await axios.get(`${this.api_url}${HEARTBEAT_ENDPOINT}`);
    }

    async fetchLastCheckedEthereumBlock(): Promise < number > {
        const { data } = await axios.get(`${this.api_url}${LAST_BLOCK_ENDPOINT}`);

        const res = new ResFetchLastCheckedBlocks(data);
        return res.lastCheckedEthBlock
    }

    async fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number > {
        const { data } = await axios.get(`${this.api_url}${LAST_BLOCK_ENDPOINT}`);

        const res = new ResFetchLastCheckedBlocks(data);

        return res.lastCheckedCudosBlock
    }

    async fetchRandomNftForMint(): Promise<NftEntity> {
        const { data } = await axios.post(`${this.api_url}${FETCH_RANDOM_NFT_FOR_PRESALE_MINT}`);

        const res = new ResFetchRandomNftForPresaleMint(data);

        return res.nftEntity;
    }

    async updateLastCheckedEthereumBlock(lastCheckedEthBlock: number): Promise < void > {
        const req = new ReqUpdateLastCheckedBlocks(lastCheckedEthBlock, null);
        await axios.put(`${this.api_url}${LAST_BLOCK_ENDPOINT}`, req);
    }

    async updateLastCheckedCudosRefundBlock(lastCheckedCudosBlock: number): Promise < void > {
        const req = new ReqUpdateLastCheckedBlocks(null, lastCheckedCudosBlock);
        await axios.put(`${this.api_url}${LAST_BLOCK_ENDPOINT}`, req);
    }

    async updateNftPrice(id: string): Promise < void > {
        const req = new ReqUpdateNftPrice(id);
        await axios.post(`${this.api_url}${UPDATE_NFT_PRICE}`, req);
    }
}
