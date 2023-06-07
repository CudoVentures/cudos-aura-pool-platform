import axios from 'axios';
import Config from '../../config/Config';
import PurchaseTransactionEntity from '../entities/PurchaseTransactionEntity';
import CudosMarketsServiceRepo from '../workers/repos/CudosMarketsServiceRepo';
import { ReqCreditPurchaseTransactionEntities } from './dto/Requests';

const HEARTBEAT_ENDPOINT = '/api/v1/general/heartbeat';
const LAST_BLOCK_ENDPOINT = '/api/v1/general/last-checked-block';
const TRIGGER_NFT_UPDATES = '/api/v1/nft/trigger-updates';
const TRIGGER_COLLECTION_UPDATES = '/api/v1/collection/trigger-updates';

const MARKETPLACE_MODULE = 'marketplace';
const NFT_MODULE = 'nft';

const CREDIT_PURCHASE_TRANSACTIONS = '/api/v1/nft/creditPurchaseTransactions'

export default class CudosMarketsServiceApi implements CudosMarketsServiceRepo {
    api_url: string;

    constructor() {
        this.api_url = Config.CUDOS_MARKETS_API;
    }

    async creditPurchaseTransactions(purchaseTransactionEntities: PurchaseTransactionEntity[]): Promise<void> {
        const req = new ReqCreditPurchaseTransactionEntities(purchaseTransactionEntities);
        await axios.put(
            `${this.api_url}${CREDIT_PURCHASE_TRANSACTIONS}`,
            req,
            {
                headers: {
                    'cudos-markets-api-key': Config.APP_CUDOS_MARKETS_API_KEY,
                },
            },
        );
    }

    async fetchHeartbeat(): Promise< void > {
        await axios.get(
            `${this.api_url}${HEARTBEAT_ENDPOINT}`,
            {
                headers: {
                    'cudos-markets-api-key': Config.APP_CUDOS_MARKETS_API_KEY,
                },
            },
        );
    }

    async fetchLastCheckedBlock(): Promise < number > {
        const { data } = await axios.get(
            `${this.api_url}${LAST_BLOCK_ENDPOINT}`,
            {
                headers: {
                    'cudos-markets-api-key': Config.APP_CUDOS_MARKETS_API_KEY,
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
                    'cudos-markets-api-key': Config.APP_CUDOS_MARKETS_API_KEY,
                },
            },
        );
    }

    async triggerUpdateMarketplaceModuleCollections(denomIds: string[], collectionIds: string[], height: number): Promise < void > {
        // console.log(`Height: ${height} -> Marketplace module | Collection | ${JSON.stringify(denomIds)} and ${JSON.stringify(collectionIds)}`);
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
                    'cudos-markets-api-key': Config.APP_CUDOS_MARKETS_API_KEY,
                },
            },
        );
    }

    async triggerUpdateMarketplaceModuleNfts(nftDtos: {tokenId: string, denomId: string}[], height: number): Promise < void > {
        // console.log(`Height: ${height} -> Marketplace module | Nft | ${JSON.stringify(nftDtos)}`);
        const res = await axios.put(
            `${this.api_url}${TRIGGER_NFT_UPDATES}`,
            {
                module: MARKETPLACE_MODULE,
                nftDtos,
                height,
            },
            {
                headers: {
                    'cudos-markets-api-key': Config.APP_CUDOS_MARKETS_API_KEY,
                },
            },
        );
    }

    async triggerUpdateNftModuleCollections(denomIds: string[], height: number): Promise < void > {
        // console.log(`Height: ${height} -> Nft module | Collection | ${JSON.stringify(denomIds)}`);
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
                    'cudos-markets-api-key': Config.APP_CUDOS_MARKETS_API_KEY,
                },
            },
        );
    }

}
