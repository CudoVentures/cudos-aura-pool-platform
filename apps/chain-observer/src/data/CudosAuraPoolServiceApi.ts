import axios from 'axios';
import Config from '../../config/Config';
import PurchaseTransactionEntity from '../entities/PurchaseTransactionEntity';
import CudosAuraPoolServiceRepo from '../workers/repos/CudosAuraPoolServiceRepo';
import { ReqCreditPurchaseTransactionEntities } from './dto/Requests';

const HEARTBEAT_ENDPOINT = '/api/v1/general/heartbeat';
const LAST_BLOCK_ENDPOINT = '/api/v1/general/last-checked-block';
const TRIGGER_NFT_UPDATES = '/api/v1/nft/trigger-updates';
const TRIGGER_COLLECTION_UPDATES = '/api/v1/collection/trigger-updates';

const MARKETPLACE_MODULE = 'marketplace';
const NFT_MODULE = 'nft';

const CREDIT_PURCHASE_TRANSACTIONS = '/api/v1/nft/creditPurchaseTransactions'

export default class CudosAuraPoolServiceApi implements CudosAuraPoolServiceRepo {
    api_url: string;

    constructor() {
        this.api_url = Config.AURA_POOL_API;
    }

    async creditPurchaseTransactions(purchaseTransactionEntities: PurchaseTransactionEntity[]): Promise<void> {
        const req = new ReqCreditPurchaseTransactionEntities(purchaseTransactionEntities);
        await axios.put(
            `${this.api_url}${CREDIT_PURCHASE_TRANSACTIONS}`,
            req,
            {
                headers: {
                    'aura-pool-api-key': Config.APP_AURA_POOL_API_KEY,
                },
            },
        );
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

    async fetchLastCheckedBlock(): Promise < number > {
        const { data } = await axios.get(
            `${this.api_url}${LAST_BLOCK_ENDPOINT}`,
            {
                headers: {
                    'aura-pool-api-key': Config.APP_AURA_POOL_API_KEY,
                },
            },
        );

        return data.height
    }

    async updateLastCheckedHeight(height: number): Promise < void > {
        const res = await axios.put(
            `${this.api_url}${LAST_BLOCK_ENDPOINT}`,
            { height },
            {
                headers: {
                    'aura-pool-api-key': Config.APP_AURA_POOL_API_KEY,
                },
            },
        );
    }

    async triggerUpdateMarketplaceModuleCollections(denomIds: string[], collectionIds: string[], height: number): Promise < void > {
        const res = await axios.put(
            `${this.api_url}${TRIGGER_COLLECTION_UPDATES}`,
            {
                module: MARKETPLACE_MODULE,
                denomIds,
                collectionIds,
                height,
            },
            {
                headers: {
                    'aura-pool-api-key': Config.APP_AURA_POOL_API_KEY,
                },
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
            {
                headers: {
                    'aura-pool-api-key': Config.APP_AURA_POOL_API_KEY,
                },
            },
        );
    }

    async triggerUpdateNftModuleCollections(denomIds: string[], height: number): Promise < void > {
        const res = await axios.put(
            `${this.api_url}${TRIGGER_COLLECTION_UPDATES}`,
            {
                module: NFT_MODULE,
                denomIds,
                collectionIds: [],
                height,
            },
            {
                headers: {
                    'aura-pool-api-key': Config.APP_AURA_POOL_API_KEY,
                },
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
            {
                headers: {
                    'aura-pool-api-key': Config.APP_AURA_POOL_API_KEY,
                },
            },
        );
    }

}
