import axios from 'axios';
import Config from '../../config/Config';
import CudosAuraPoolServiceRepo from '../workers/repos/CudosAuraPoolServiceRepo';

const HEARTBEAT_ENDPOINT = '/api/v1/general/heartbeat';
const LAST_BLOCK_ENDPOINT = '/api/v1/general/last-checked-block';
const TRIGGER_NFT_UPDATES = '/api/v1/nft/trigger-updates';
const TRIGGER_COLLECTION_UPDATES = '/api/v1/collection/trigger-updates';

export default class CudosAuraPoolServiceApi implements CudosAuraPoolServiceRepo {
    api_url: string;

    constructor() {
        this.api_url = Config.AURA_POOL_API;
    }

    async fetchHeartbeat(): Promise< void > {
        await axios.get(`${this.api_url}${HEARTBEAT_ENDPOINT}`);
    }

    async fetchLastCheckedBlock(): Promise < number > {
        const res = await axios.get(`${this.api_url}${LAST_BLOCK_ENDPOINT}`);

        return res.data.lastBlock
    }

    async triggerUpdateCollections(denomIds: string[]): Promise < void > {
        const res = await axios.put(`${this.api_url}${TRIGGER_COLLECTION_UPDATES}`, denomIds);
    }

    async triggerUpdateNfts(tokenIds: string[]): Promise < void > {
        const res = await axios.put(`${this.api_url}${TRIGGER_NFT_UPDATES}`, tokenIds);
    }

    async updateLastCheckedheight(height: number): Promise < void > {
        const res = await axios.put(`${this.api_url}${LAST_BLOCK_ENDPOINT}`, height);
    }
}
