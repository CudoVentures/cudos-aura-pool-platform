import axios from 'axios';
import Config from '../../config/Config';
import CudosAuraPoolServiceRepo from '../workers/repos/CudosAuraPoolServiceRepo';
import { ReqUpdateLastCheckedBlocks } from './dto/Requests';
import { ResFetchLastCheckedBlocks } from './dto/Responses';

const HEARTBEAT_ENDPOINT = '/api/v1/general/heartbeat';
const LAST_BLOCK_ENDPOINT = '/api/v1/general/last-checked-payment-relayer-blocks';

export default class CudosAuraPoolServiceApiRepo implements CudosAuraPoolServiceRepo {
    api_url: string;

    constructor() {
        this.api_url = Config.AURA_POOL_API;
    }

    async fetchHeartbeat(): Promise< void > {
        await axios.get(
            `${this.api_url}${HEARTBEAT_ENDPOINT}`,
            {
                headers: {
                    'aura-pool-api-key': Config.APP_AURA_POOL_API_KEY,
                },
            },
        );
    }

    async fetchLastCheckedEthereumBlock(): Promise < number > {
        const { data } = await axios.get(
            `${this.api_url}${LAST_BLOCK_ENDPOINT}`,
            {
                headers: {
                    'aura-pool-api-key': Config.APP_AURA_POOL_API_KEY,
                },
            },
        );

        const res = new ResFetchLastCheckedBlocks(data);
        return res.lastCheckedEthBlock
    }

    async fetchLastCheckedPaymentRelayerCudosBlock(): Promise < number > {
        const { data } = await axios.get(
            `${this.api_url}${LAST_BLOCK_ENDPOINT}`,
            {
                headers: {
                    'aura-pool-api-key': Config.APP_AURA_POOL_API_KEY,
                },
            },
        );

        const res = new ResFetchLastCheckedBlocks(data);

        return res.lastCheckedCudosBlock
    }

    async updateLastCheckedEthereumBlock(lastCheckedEthBlock: number): Promise < void > {
        const req = new ReqUpdateLastCheckedBlocks(lastCheckedEthBlock, null);
        await axios.put(
            `${this.api_url}${LAST_BLOCK_ENDPOINT}`,
            req,
            {
                headers: {
                    'aura-pool-api-key': Config.APP_AURA_POOL_API_KEY,
                },
            },
        );
    }

    async updateLastCheckedCudosRefundBlock(lastCheckedCudosBlock: number): Promise < void > {
        const req = new ReqUpdateLastCheckedBlocks(null, lastCheckedCudosBlock);
        await axios.put(
            `${this.api_url}${LAST_BLOCK_ENDPOINT}`,
            req,
            {
                headers: {
                    'aura-pool-api-key': Config.APP_AURA_POOL_API_KEY,
                },
            },
        );
    }
}
