import { decodeTxRaw, StargateClient } from 'cudosjs';
import Config from '../../config/Config';
import {
    HeightFilter,
    MarketplaceCollectionEventTypes,
    MarketplaceModuleFilter,
    MarketplaceNftEventTypes,
    NftModuleCollectionEventTypes,
    NftModuleFilter,
    NftModuleNftEventTypes,
    OnDemandMintNftMintFilter,
    OnDemandMintReceivedFundsFilter,
    OnDemandMintRefundsFilter,
} from '../entities/CudosAuraPoolServiceTxFilter';
import MintMemo from '../entities/MintMemo';
import PurchaseTransactionEntity, { PurchaseTransactionStatus } from '../entities/PurchaseTransactionEntity';
import CudosAuraPoolServiceRepo from './repos/CudosAuraPoolServiceRepo';
import { EmailRepo } from './repos/EmailRepo';

export default class TxFindWorker {
    chainClient: StargateClient;
    cudosAuraPoolServiceApi: CudosAuraPoolServiceRepo;
    emailRepo: EmailRepo;

    lastSentEmailTimestamp: number;

    constructor(chainClient: StargateClient, cudosAuraPoolServiceApi: CudosAuraPoolServiceRepo, emailRepo: EmailRepo) {
        this.chainClient = chainClient;
        this.cudosAuraPoolServiceApi = cudosAuraPoolServiceApi;
        this.emailRepo = emailRepo;
        this.lastSentEmailTimestamp = 0;
    }

    async run() {
        try {
            // get last checked block
            const lastCheckedBlock = await this.cudosAuraPoolServiceApi.fetchLastCheckedBlock();
            const nextBlockToCheck = lastCheckedBlock + 1;
            console.log('last checked block: ', lastCheckedBlock);
            // get last block
            // limit to 10000 blocks per run if the service is lagging behind
            let lastBlock = await this.chainClient.getHeight();
            const blockCheckLimit = Config.BLOCK_CHECK_LIMIT;

            // lastBlock = lastBlock > lastCheckedBlock + blockCheckLimit ? lastCheckedBlock + blockCheckLimit : lastBlock;
            lastBlock = Math.min(nextBlockToCheck + blockCheckLimit, lastBlock);

            const heightFilter: HeightFilter = {
                minHeight: nextBlockToCheck,
                maxHeight: lastBlock,
            };
            console.log(`now checking [${heightFilter.minHeight}, ${heightFilter.maxHeight}]`);

            // filter txs in these blocks
            await this.checkMarketplaceTransactions(heightFilter);
            await this.checkNftTransactions(heightFilter);
            await this.checkOnDemandMintReceivedFundsTransactions(heightFilter);
            await this.checkOnDemandRefundTransactions(heightFilter);
            await this.checkOnDemandMintTransactions(heightFilter);

            await this.cudosAuraPoolServiceApi.updateLastCheckedHeight(lastBlock);
        } catch (e) {
            console.log('error', e);

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

    async checkMarketplaceTransactions(heightFilter: HeightFilter) {
        // const marketplaceTxs = await this.chainClient.searchTx(makeHeightSearchQuery(MarketplaceModuleFilter, heightFilter));
        const marketplaceTxs = await this.chainClient.searchTxLegacy(MarketplaceModuleFilter, heightFilter.minHeight, heightFilter.maxHeight);
        const marketplaceDataJson = marketplaceTxs.map((tx) => JSON.parse(tx.rawLog));
        const marketplaceEvents = marketplaceDataJson.flat().map((a) => a.events).flat();
        const marketplaceModuleNftEvents = marketplaceEvents.filter((event) => MarketplaceNftEventTypes.includes(event.type));
        const marketplaceModuleCollectionEvents = marketplaceEvents.filter((event) => MarketplaceCollectionEventTypes.includes(event.type));

        console.log('Marketplace transactions: ', marketplaceModuleCollectionEvents.length, marketplaceModuleNftEvents.length);
        if (marketplaceModuleCollectionEvents.length > 0) {
            const denomIds: string[] = marketplaceModuleCollectionEvents.map((event) => {
                return event.attributes.find((attribute) => attribute.key === 'denom_id')?.value ?? -1;
            }).filter((denomId) => denomId !== -1);
            const collectionIds: string[] = marketplaceModuleCollectionEvents.map((event) => {
                return event.attributes.find((attribute) => attribute.key === 'collection_id')?.value ?? -1;
            }).filter((collectionId) => collectionId !== -1);

            const denomIdsSet = new Set(denomIds);
            const uniqueDenomIds = Array.from(denomIdsSet);

            const collectionIdsSet = new Set(collectionIds);
            const uniqueCollectionIds = Array.from(collectionIdsSet);

            console.log('Trigger update for uniqueDenomIds: ', uniqueDenomIds);
            await this.cudosAuraPoolServiceApi.triggerUpdateMarketplaceModuleCollections(uniqueDenomIds, uniqueCollectionIds, heightFilter.maxHeight);
        }

        if (marketplaceModuleNftEvents.length > 0) {
            const nftDtos = marketplaceModuleNftEvents.map((event) => {
                const tokenId = event.attributes.find((attribute) => attribute.key === 'token_id').value;
                const denomId = event.attributes.find((attribute) => attribute.key === 'denom_id').value;

                return { tokenId, denomId };
            }).filter((value, index, self) => self.indexOf(value) === index);

            console.log('Trigger update for nftDtos: ', nftDtos);
            await this.cudosAuraPoolServiceApi.triggerUpdateMarketplaceModuleNfts(nftDtos, heightFilter.maxHeight);
        }
    }

    async checkNftTransactions(heightFilter) {
        // const nftModuleTxs = await this.chainClient.searchTx(makeHeightSearchQuery(NftModuleFilter, heightFilter));
        const nftModuleTxs = await this.chainClient.searchTxLegacy(NftModuleFilter, heightFilter.minHeight, heightFilter.maxHeight);
        const nftModuleDataJson = nftModuleTxs.map((tx) => JSON.parse(tx.rawLog));
        const nftModuleEvents = nftModuleDataJson.flat().map((a) => a.events).flat();
        const nftModuleNftEvents = nftModuleEvents.filter((event) => NftModuleNftEventTypes.includes(event.type));
        const nftModuleCollectionEvents = nftModuleEvents.filter((event) => NftModuleCollectionEventTypes.includes(event.type));

        console.log('Nft transactions: ', nftModuleCollectionEvents.length, nftModuleNftEvents.length);
        if (nftModuleCollectionEvents.length > 0) {
            const denomIds = nftModuleCollectionEvents.map((event) => {
                const denomId = event.attributes.find((attribute) => attribute.key === 'denom_id').value;
                return denomId;
            }).filter((value, index, self) => self.indexOf(value) === index);

            console.log('Trigger update for denomIds: ', denomIds);
            await this.cudosAuraPoolServiceApi.triggerUpdateNftModuleCollections(denomIds, heightFilter.maxHeight);
        }

        if (nftModuleNftEvents.length > 0) {
            const tokenIds = nftModuleNftEvents.map((event) => {
                const tokenId = event.attributes.find((attribute) => attribute.key === 'token_id').value;
                const denomId = event.attributes.find((attribute) => attribute.key === 'denom_id').value;

                return { tokenId, denomId };
            }).filter((value, index, self) => self.indexOf(value) === index);

            console.log('Trigger update for tokenIds: ', tokenIds);
            await this.cudosAuraPoolServiceApi.triggerUpdateMarketplaceModuleNfts(tokenIds, heightFilter.maxHeight);
        }

    }

    async checkOnDemandMintReceivedFundsTransactions(heightFilter) {
        // const fundsReceivedTxs = await this.chainClient.searchTx(makeHeightSearchQuery(OnDemandMintReceivedFundsFilter, heightFilter));
        const fundsReceivedTxs = await this.chainClient.searchTxLegacy(OnDemandMintReceivedFundsFilter, heightFilter.minHeight, heightFilter.maxHeight);

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

        console.log('Mint pending: ', purchaseTransactionEntities.map((pte) => pte.txhash));
        if (purchaseTransactionEntities.length > 0) {
            await this.cudosAuraPoolServiceApi.creditPurchaseTransactions(purchaseTransactionEntities);
        }
    }

    async checkOnDemandRefundTransactions(heightFilter) {
        // const refundTransactions = await this.chainClient.searchTx(makeHeightSearchQuery(OnDemandMintRefundsFilter, heightFilter));
        const refundTransactions = await this.chainClient.searchTxLegacy(OnDemandMintRefundsFilter, heightFilter.minHeight, heightFilter.maxHeight);

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

        console.log('Mint refunds: ', purchaseTransactionEntities.map((pte) => pte.txhash));
        if (purchaseTransactionEntities.length > 0) {
            await this.cudosAuraPoolServiceApi.creditPurchaseTransactions(purchaseTransactionEntities);
        }
    }

    async checkOnDemandMintTransactions(heightFilter) {
        // const mintTransactions = await this.chainClient.searchTx(makeHeightSearchQuery(OnDemandMintNftMintFilter, heightFilter));
        const mintTransactions = await this.chainClient.searchTxLegacy(OnDemandMintNftMintFilter, heightFilter.minHeight, heightFilter.maxHeight);
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

        console.log('Mint success: ', purchaseTransactionEntities.map((pte) => pte.txhash));
        if (purchaseTransactionEntities.length > 0) {
            await this.cudosAuraPoolServiceApi.creditPurchaseTransactions(purchaseTransactionEntities);
        }
    }

}
