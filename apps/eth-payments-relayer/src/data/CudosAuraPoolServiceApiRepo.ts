import axios from 'axios';
import Config from '../../config/Config';
import NftEntity from '../entities/NftEntity';
import CudosAuraPoolServiceRepo from '../workers/repos/CudosAuraPoolServiceRepo';
import { ReqFetchNftsByIds, ReqUpdateLastCheckedBlocks } from './dto/Requests';
import { ResFetchLastCheckedBlocks, ResFetchNftsByIds } from './dto/Responses';

const HEARTBEAT_ENDPOINT = '/api/v1/general/heartbeat';
const LAST_BLOCK_ENDPOINT = '/api/v1/general/last-checked-payment-relayer-blocks';
const FETCH_NFTS_BY_IDS_ENDPOINT = '/api/v1/nft';

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

    async fetchNftsMapByIds(nftIds: string[]): Promise < Map< string, NftEntity > > {
        const req = new ReqFetchNftsByIds(nftIds);
        const { data } = await axios.post(`${this.api_url}${FETCH_NFTS_BY_IDS_ENDPOINT}`, req);

        const res = new ResFetchNftsByIds(data);
        const nftMap = new Map<string, NftEntity>();
        res.nftEntities.forEach((nftEntity) => {
            nftMap.set(nftEntity.id, nftEntity);
        })

        return nftMap;
    }

    async updateLastCheckedEthereumBlock(lastCheckedEthBlock: number): Promise < void > {
        const req = new ReqUpdateLastCheckedBlocks(lastCheckedEthBlock, null);
        await axios.put(`${this.api_url}${LAST_BLOCK_ENDPOINT}`, req);
    }

    async updateLastCheckedCudosRefundBlock(lastCheckedCudosBlock: number): Promise < void > {
        const req = new ReqUpdateLastCheckedBlocks(null, lastCheckedCudosBlock);
        await axios.put(`${this.api_url}${LAST_BLOCK_ENDPOINT}`, req);
    }
}
