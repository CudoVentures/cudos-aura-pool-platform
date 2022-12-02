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
        try {
        // get last checked block
            const lastCheckedBlock = await this.cudosAuraPoolServiceApi.fetchLastCheckedBlock();
            console.log('last checked block: ', lastCheckedBlock);
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
        } catch (e) {
            console.log(e);
        }
    }

    async checkMarketplaceTransactions(heightFilter) {
        const marketplaceTxs = await this.chainClient.searchTx(MarketplaceModuleFilter, heightFilter)
        const marketplaceDataJson = marketplaceTxs.map((tx) => JSON.parse(tx.rawLog));
        const marketplaceEvents = marketplaceDataJson.flat().map((a) => a.events).flat();
        const marketplaceModuleNftEvents = marketplaceEvents.filter((event) => MarketplaceNftEventTypes.includes(event.type));
        const marketplaceModuleCollectionEvents = marketplaceEvents.filter((event) => MarketplaceCollectionEventTypes.includes(event.type));

        if (marketplaceModuleCollectionEvents.length > 0) {
            const collectionIds = marketplaceModuleCollectionEvents.map((event) => {
                const collectionId = event.attributes.find((attribute) => attribute.key === 'denom_id').value;
                return collectionId;
            }).filter((value, index, self) => self.indexOf(value) === index);
            await this.cudosAuraPoolServiceApi.triggerUpdateMarketplaceModuleCollections(collectionIds);
        }

        if (marketplaceModuleNftEvents.length > 0) {
            const tokenIds = marketplaceModuleNftEvents.map((event) => {
                const collectionId = event.attributes.find((attribute) => attribute.key === 'nft_id').value;
                return collectionId;
            }).filter((value, index, self) => self.indexOf(value) === index);

            await this.cudosAuraPoolServiceApi.triggerUpdateMarketplaceModuleNfts(tokenIds);
        }
    }

    async checkNftTransactions(heightFilter) {
        const nftModuleTxs = await this.chainClient.searchTx(NftModuleFilter, heightFilter)
        const nftModuleDataJson = nftModuleTxs.map((tx) => JSON.parse(tx.rawLog));
        const nftModuleEvents = nftModuleDataJson.flat().map((a) => a.events).flat();
        const nftModuleNftEvents = nftModuleEvents.filter((event) => NftModuleNftEventTypes.includes(event.type));
        const nftModuleCollectionEvents = nftModuleEvents.filter((event) => NftModuleCollectionEventTypes.includes(event.type));

        if (nftModuleCollectionEvents.length > 0) {

            const denomIds = nftModuleCollectionEvents.map((event) => {
                const denomId = event.attributes.find((attribute) => attribute.key === 'denom_id').value;
                return denomId;
            }).filter((value, index, self) => self.indexOf(value) === index);

            await this.cudosAuraPoolServiceApi.triggerUpdateNftModuleCollections(denomIds);
        }

        if (nftModuleNftEvents.length > 0) {

            const tokenIds = nftModuleNftEvents.map((event) => {
                const tokenId = event.attributes.find((attribute) => attribute.key === 'token_id').value;
                return tokenId;
            }).filter((value, index, self) => self.indexOf(value) === index);

            await this.cudosAuraPoolServiceApi.triggerUpdateNftModuleNfts(tokenIds);
        }

    }
}
