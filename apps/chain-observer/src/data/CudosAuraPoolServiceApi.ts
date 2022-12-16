import axios from 'axios';
import Config from '../../config/Config';
import CudosAuraPoolServiceRepo from '../workers/repos/CudosAuraPoolServiceRepo';

const HEARTBEAT_ENDPOINT = '/api/v1/general/heartbeat';
const LAST_BLOCK_ENDPOINT = '/api/v1/general/last-checked-block';
const TRIGGER_NFT_UPDATES = '/api/v1/nft/trigger-updates';
const TRIGGER_COLLECTION_UPDATES = '/api/v1/collection/trigger-updates';

const MARKETPLACE_MODULE = 'marketplace';
const NFT_MODULE = 'nft';

export default class CudosAuraPoolServiceApi implements CudosAuraPoolServiceRepo {
    api_url: string;

    constructor() {
        this.api_url = Config.AURA_POOL_API;
    }

    async fetchHeartbeat(): Promise< void > {
        await axios.get(`${this.api_url}${HEARTBEAT_ENDPOINT}`);
    }

    async fetchLastCheckedBlock(): Promise < number > {
        const { data } = await axios.get(`${this.api_url}${LAST_BLOCK_ENDPOINT}`);

        return data.height
    }

    async updateLastCheckedheight(height: number): Promise < void > {
        const res = await axios.put(`${this.api_url}${LAST_BLOCK_ENDPOINT}`, { height });
    }

    async triggerUpdateMarketplaceModuleCollections(denomIds: string[], height: number): Promise < void > {
        const res = await axios.put(
            `${this.api_url}${TRIGGER_COLLECTION_UPDATES}`,
            {
                module: MARKETPLACE_MODULE,
                denomIds,
                height,
            },
        );
    }

    async triggerUpdateMarketplaceModuleNfts(nftDtos: {tokenId: string, denomId: string}[], height: number): Promise < void > {
        const res = await axios.put(
            `${this.api_url}${TRIGGER_NFT_UPDATES}`,
            {
                module: MARKETPLACE_MODULE,
                nftDtos,
                height,
            },
        );
    }

    async triggerUpdateNftModuleCollections(denomIds: string[], height: number): Promise < void > {
        const res = await axios.put(
            `${this.api_url}${TRIGGER_COLLECTION_UPDATES}`,
            {
                module: NFT_MODULE,
                denomIds,
                height,
            },
        );
    }

    async triggerUpdateNftModuleNfts(tokenIds: string[], height: number): Promise < void > {
        const res = await axios.put(
            `${this.api_url}${TRIGGER_NFT_UPDATES}`,
            {
                module: NFT_MODULE,
                tokenIds,
                height,
            },
        );
    }

}
