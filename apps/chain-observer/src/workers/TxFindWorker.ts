import { StargateClient } from '@cosmjs/stargate';
import { decodeTxRaw } from 'cudosjs';
import Config from '../../config/Config';
import {
    MarketplaceCollectionEventTypes,
    MarketplaceModuleFilter,
    MarketplaceNftEventTypes,
    NftModuleCollectionEventTypes,
    NftModuleFilter,
    NftModuleNftEventTypes,
    OnDemandMintNftMintFilter,
    OnDemandMintReceivedFundsFilter,
    OnDemandMintRefundsFilter,
} from '../entities/CudosMarketsServiceTxFilter';
import MintMemo from '../entities/MintMemo';
import PurchaseTransactionEntity, { PurchaseTransactionStatus } from '../entities/PurchaseTransactionEntity';
import CudosMarketsServiceRepo from './repos/CudosMarketsServiceRepo';
import { EmailRepo } from './repos/EmailRepo';

export default class TxFindWorker {
    chainClient: StargateClient;
    cudosMarketsServiceApi: CudosMarketsServiceRepo;
    emailRepo: EmailRepo;

    lastSentEmailTimestamp: number;

    constructor(chainClient: StargateClient, cudosMarketsServiceApi: CudosMarketsServiceRepo, emailRepo: EmailRepo) {
        this.chainClient = chainClient;
        this.cudosMarketsServiceApi = cudosMarketsServiceApi;
        this.emailRepo = emailRepo;
        this.lastSentEmailTimestamp = 0;
    }

    async run() {
        try {
            // get last checked block
            const lastCheckedBlock = await this.cudosMarketsServiceApi.fetchLastCheckedBlock();
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
            await this.checkOnDemandMintReceivedFundsTransactions(heightFilter);
            await this.checkOnDemandRefundTransactions(heightFilter);
            await this.checkOnDemandMintTransactions(heightFilter);

            await this.cudosMarketsServiceApi.updateLastCheckedHeight(lastBlock);
        } catch (e) {
            console.log(e.message);

            // sending an email once every 30 min
            if (Date.now() - this.lastSentEmailTimestamp > 1800000) {
                const ts = Date.now();
                console.log('sending an email at', new Date(ts).toString())
                this.lastSentEmailTimestamp = ts;
                this.emailRepo.sendEmail(e.toString());
            } else {
                console.log('Next error email can be send no sooner than', (1800000 - (Date.now() - this.lastSentEmailTimestamp)) / 1000, ' s');
            }
        }
    }

    async checkMarketplaceTransactions(heightFilter) {
        const marketplaceTxs = await this.chainClient.searchTx(MarketplaceModuleFilter, heightFilter)
        const marketplaceDataJson = marketplaceTxs.map((tx) => JSON.parse(tx.rawLog));
        const marketplaceEvents = marketplaceDataJson.flat().map((a) => a.events).flat();
        const marketplaceModuleNftEvents = marketplaceEvents.filter((event) => MarketplaceNftEventTypes.includes(event.type));
        const marketplaceModuleCollectionEvents = marketplaceEvents.filter((event) => MarketplaceCollectionEventTypes.includes(event.type));

        if (marketplaceModuleCollectionEvents.length > 0) {
            const denomIds = marketplaceModuleCollectionEvents.map((event) => {
                return event.attributes.find((attribute) => attribute.key === 'denom_id')?.value ?? -1;
            }).filter((denomId) => denomId !== -1);
            const collectionIds = marketplaceModuleCollectionEvents.map((event) => {
                return event.attributes.find((attribute) => attribute.key === 'collection_id')?.value ?? -1;
            }).filter((collectionId) => collectionId !== -1);

            const denomIdsSet = new Set(denomIds);
            const uniqueDenomIds = Array.from(denomIdsSet);

            const collectionIdsSet = new Set(collectionIds);
            const uniqueCollectionIds = Array.from(collectionIdsSet);

            await this.cudosMarketsServiceApi.triggerUpdateMarketplaceModuleCollections(uniqueDenomIds, uniqueCollectionIds, heightFilter.maxHeight);
        }

        if (marketplaceModuleNftEvents.length > 0) {
            const nftDtos = marketplaceModuleNftEvents.map((event) => {
                const tokenId = event.attributes.find((attribute) => attribute.key === 'token_id').value;
                const denomId = event.attributes.find((attribute) => attribute.key === 'denom_id').value;

                return { tokenId, denomId };
            }).filter((value, index, self) => self.indexOf(value) === index);

            await this.cudosMarketsServiceApi.triggerUpdateMarketplaceModuleNfts(nftDtos, heightFilter.maxHeight);
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

            await this.cudosMarketsServiceApi.triggerUpdateNftModuleCollections(denomIds, heightFilter.maxHeight);
        }

        if (nftModuleNftEvents.length > 0) {
            const tokenIds = nftModuleNftEvents.map((event) => {
                const tokenId = event.attributes.find((attribute) => attribute.key === 'token_id').value;
                const denomId = event.attributes.find((attribute) => attribute.key === 'denom_id').value;

                return { tokenId, denomId };
            }).filter((value, index, self) => self.indexOf(value) === index);

            await this.cudosMarketsServiceApi.triggerUpdateMarketplaceModuleNfts(tokenIds, heightFilter.maxHeight);
        }

    }

    async checkOnDemandMintReceivedFundsTransactions(heightFilter) {
        const fundsReceivedTxs = await this.chainClient.searchTx(OnDemandMintReceivedFundsFilter, heightFilter)

        const purchaseTransactionEntities = [];
        for (let i = 0; i < fundsReceivedTxs.length; i++) {
            const tx = fundsReceivedTxs[i];

            const memo = decodeTxRaw(tx.tx).body.memo;
            let memoJson;
            try {
                memoJson = JSON.parse(memo);
            } catch (e) {
                continue;
            }

            const mintMemo = MintMemo.fromJson(memoJson);
            if (mintMemo.ethTxHash !== '') {
                continue;
            }

            const purchaseTransactionEntity = new PurchaseTransactionEntity();
            purchaseTransactionEntity.txhash = tx.hash;
            purchaseTransactionEntity.recipientAddress = memoJson.recipientAddress;

            const block = await this.chainClient.getBlock(tx.height);
            purchaseTransactionEntity.timestamp = new Date(block.header.time).getTime();

            purchaseTransactionEntities.push(purchaseTransactionEntity);
        }

        if (purchaseTransactionEntities.length > 0) {
            await this.cudosMarketsServiceApi.creditPurchaseTransactions(purchaseTransactionEntities);
        }
    }

    async checkOnDemandRefundTransactions(heightFilter) {
        const refundTransactions = await this.chainClient.searchTx(OnDemandMintRefundsFilter, heightFilter)

        const purchaseTransactionEntities = [];
        for (let i = 0; i < refundTransactions.length; i++) {
            const tx = refundTransactions[i];

            // on demand minter sets memo to be the receive funds tx hash
            const txhash = decodeTxRaw(tx.tx).body.memo;

            if (txhash.length !== '8A3065FFE24859FB066A0F50B3F9C02DBB532A52BF43A1E74F1897AB7E8AF33C'.length) {
                continue;
            }
            const originalTx = await this.chainClient.getTx(txhash);

            const memoJson = JSON.parse(decodeTxRaw(originalTx.tx).body.memo);
            const mintMemo = MintMemo.fromJson(memoJson);

            if (mintMemo.ethTxHash !== '') {
                continue;
            }

            const purchaseTransactionEntity = new PurchaseTransactionEntity();
            purchaseTransactionEntity.txhash = txhash;
            purchaseTransactionEntity.status = PurchaseTransactionStatus.REFUNDED;

            purchaseTransactionEntities.push(purchaseTransactionEntity);
        }

        if (purchaseTransactionEntities.length > 0) {
            await this.cudosMarketsServiceApi.creditPurchaseTransactions(purchaseTransactionEntities);
        }
    }

    async checkOnDemandMintTransactions(heightFilter) {
        const mintTransactions = await this.chainClient.searchTx(OnDemandMintNftMintFilter, heightFilter)
        const purchaseTransactionEntities = [];
        for (let i = 0; i < mintTransactions.length; i++) {
            const tx = mintTransactions[i];

            // on demand minter sets memo to be the receive funds tx hash
            const txhash = decodeTxRaw(tx.tx).body.memo;

            if (txhash.length !== '8A3065FFE24859FB066A0F50B3F9C02DBB532A52BF43A1E74F1897AB7E8AF33C'.length) {
                continue;
            }
            const originalTx = await this.chainClient.getTx(txhash);

            const memoJson = JSON.parse(decodeTxRaw(originalTx.tx).body.memo);
            const mintMemo = MintMemo.fromJson(memoJson);

            const purchaseTransactionEntity = new PurchaseTransactionEntity();
            if (mintMemo.ethTxHash !== '') {
                purchaseTransactionEntity.txhash = mintMemo.ethTxHash;
            } else {
                purchaseTransactionEntity.txhash = txhash;
            }

            purchaseTransactionEntity.status = PurchaseTransactionStatus.SUCCESS;

            purchaseTransactionEntities.push(purchaseTransactionEntity);
        }

        if (purchaseTransactionEntities.length > 0) {
            await this.cudosMarketsServiceApi.creditPurchaseTransactions(purchaseTransactionEntities);
        }
    }

}
