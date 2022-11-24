import { StargateClient } from '@cosmjs/stargate';
import Config from '../../config/Config';
import {
    MarketplaceCollectionEventTypes,
    MarketplaceModuleFilter,
    MarketplaceNftEventTypes,
    NftModuleCollectionEventTypes,
    NftModuleFilter,
    NftModuleNftEventTypes,
} from '../entities/CudosAuraPoolServiceTxFilter';
import CudosAuraPoolServiceRepo from './repos/CudosAuraPoolServiceRepo';

export default class TxFindWorker {
    chainClient: StargateClient;
    cudosAuraPoolServiceApi: CudosAuraPoolServiceRepo;

    constructor(chainClient: StargateClient, cudosAuraPoolServiceApi: CudosAuraPoolServiceRepo) {
        this.chainClient = chainClient;
        this.cudosAuraPoolServiceApi = cudosAuraPoolServiceApi;
    }

    async run() {
        // get last checked block
        // const lastCheckedBlock = await this.cudosAuraPoolServiceApi.fetchLastCheckedBlock();
        const lastCheckedBlock = 1;

        // get last block
        // limit to 10000 blocks per run if the service is lagging behind
        let lastBlock = await this.chainClient.getHeight();
        const blockCheckLimit = Config.BLOCK_CHECK_LIMIT;

        lastBlock = lastBlock > lastCheckedBlock + blockCheckLimit ? lastCheckedBlock + blockCheckLimit : lastBlock;

        const heightFilter = {
            minHeight: lastCheckedBlock,
            maxHeight: lastBlock,
        };

        // filter txs in these blocks
        await this.checkMarketplaceTransactions(heightFilter);
        await this.checkNftTransactions(heightFilter);

        await this.cudosAuraPoolServiceApi.updateLastCheckedheight(lastBlock);
    }

    async checkMarketplaceTransactions(heightFilter) {
        const marketplaceTxs = await this.chainClient.searchTx(MarketplaceModuleFilter, heightFilter)
        const marketplaceDataJson = marketplaceTxs.map((tx) => JSON.parse(tx.rawLog));
        const marketplaceEvents = marketplaceDataJson.flat().map((a) => a.events).flat();
        const marketplaceModuleNftEvents = marketplaceEvents.filter((event) => MarketplaceNftEventTypes.includes(event.type));
        const marketplaceModuleCollectionEvents = marketplaceEvents.filter((event) => MarketplaceCollectionEventTypes.includes(event.type));

        if (marketplaceModuleNftEvents.length > 0) {
            const collectionIds = marketplaceModuleNftEvents.map((event) => {
                const collectionId = event.attributes.find((attribute) => attribute.key === 'denom_id').value;
                return collectionId;
            })

            this.cudosAuraPoolServiceApi.triggerUpdateCollections(collectionIds);
        }

        if (marketplaceModuleCollectionEvents.length > 0) {
            const nftIds = marketplaceModuleCollectionEvents.map((event) => {
                const collectionId = event.attributes.find((attribute) => attribute.key === 'token_id').value;
                return collectionId;
            })

            this.cudosAuraPoolServiceApi.triggerUpdateNfts(nftIds);
        }
    }

    async checkNftTransactions(heightFilter) {
        const nftModuleTxs = await this.chainClient.searchTx(NftModuleFilter, heightFilter)
        const nftModuleDataJson = nftModuleTxs.map((tx) => JSON.parse(tx.rawLog));
        const nftModuleEvents = nftModuleDataJson.flat().map((a) => a.events).flat();
        const nftModuleNftEvents = nftModuleEvents.filter((event) => NftModuleNftEventTypes.includes(event.type));
        const nftModuleCollectionEvents = nftModuleEvents.filter((event) => NftModuleCollectionEventTypes.includes(event.type));

        if (nftModuleNftEvents.length > 0) {
            const collectionIds = nftModuleNftEvents.map((event) => {
                const collectionId = event.attributes.find((attribute) => attribute.key === 'denom_id').value;
                return collectionId;
            })

            this.cudosAuraPoolServiceApi.triggerUpdateCollections(collectionIds);
        }

        if (nftModuleCollectionEvents.length > 0) {
            const nftIds = nftModuleCollectionEvents.map((event) => {
                const collectionId = event.attributes.find((attribute) => attribute.key === 'token_id').value;
                return collectionId;
            })

            this.cudosAuraPoolServiceApi.triggerUpdateNfts(nftIds);
        }

    }
}
