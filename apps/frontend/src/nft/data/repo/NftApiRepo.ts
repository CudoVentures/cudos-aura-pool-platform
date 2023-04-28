import { CHAIN_DETAILS, ETH_CONSTS } from '../../../core/utilities/Constants';
import CollectionEntity, { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import NftEntity, { NftGroup, NftStatus, NftTier, tierPriceMap } from '../../entities/NftEntity';
import NftRepo, { BuyingCurrency } from '../../presentation/repos/NftRepo';
import NftFilterModel, { NftOrderBy } from '../../utilities/NftFilterModel';
import NftApi from '../data-sources/NftApi';
import { SigningStargateClient, GasPrice, Ledger, CURRENCY_DECIMALS } from 'cudosjs';
import Long from 'long';
import S from '../../../core/utilities/Main';
import BigNumber from 'bignumber.js';
import { coin } from 'cudosjs/build/proto-signing';
import NftSessionStorage from '../data-sources/NftSessionStorage';
import Web3 from 'web3';
import contractABI from '../../../ethereum/contracts/CudosMarkets.sol/CudosMarkets.json';
import MintMemo from '../../entities/MintMemo';
import AddressMintDataEntity from '../../../nft-presale/entities/AddressMintDataEntity';
import { Coin } from 'cudosjs/build/stargate/modules/marketplace/proto-types/coin';
import PurchaseTransactionsFilterModel from '../../entities/PurchaseTransactionsFilterModel';
import PurchaseTransactionEntity from '../../entities/PurchaseTransactionEntity';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';

export default class NftApiRepo implements NftRepo {

    nftApi: NftApi;
    nftSessionStorage: NftSessionStorage;

    enableActions: () => void;
    disableActions: () => void;
    showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void;

    constructor() {
        this.nftApi = new NftApi();
        this.nftSessionStorage = new NftSessionStorage();

        this.enableActions = null;
        this.disableActions = null;
        this.showAlert = null;
    }

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void) {
        this.enableActions = enableActions;
        this.disableActions = disableActions;
    }

    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener: null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void) {
        this.showAlert = showAlert;
    }

    async fetchNftById(nftId: string, status: CollectionStatus): Promise < NftEntity > {
        const nftEntities = await this.fetchNftByIds([nftId], status);

        return nftEntities.length === 1 ? nftEntities[0] : null;
    }

    async fetchNftByIds(nftIds: string[], status: CollectionStatus): Promise < NftEntity[] > {
        const nftFilterModel = new NftFilterModel();

        nftFilterModel.nftIds = nftIds;
        if (status) {
            nftFilterModel.collectionStatus = [status];
        }

        const { nftEntities } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities;
    }

    async fetchPurchaseTransactions(purchaseTransactionsFilterModel: PurchaseTransactionsFilterModel): Promise<{ purchaseTransactionEntities: PurchaseTransactionEntity[], total: number }> {
        try {
            this.disableActions?.();
            const sessionStoragePurchaseTransactionEntities = [];
            this.nftSessionStorage.getPurchaseTxsMap().forEach((value) => {
                sessionStoragePurchaseTransactionEntities.push(value);
            })

            return await this.nftApi.fetchPurchaseTransactions(purchaseTransactionsFilterModel, sessionStoragePurchaseTransactionEntities)
        } finally {
            this.enableActions?.();
        }
    }

    async fetchPresaleAmounts(): Promise < { totalPresaleNftCount: number, presaleMintedNftCount } > {
        try {
            this.disableActions?.();
            return await this.nftApi.fetchPresaleAmounts()
        } finally {
            this.enableActions?.();
        }
    }

    async fetchNewNftDrops(status: CollectionStatus = CollectionStatus.APPROVED): Promise < NftEntity[] > {
        const nftFilterModel = new NftFilterModel();

        nftFilterModel.collectionStatus = [status];
        nftFilterModel.orderBy = NftOrderBy.TIMESTAMP_DESC;
        nftFilterModel.from = 0;
        nftFilterModel.count = 10;

        const { nftEntities } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities;
    }

    async fetchTrendingNfts(status: CollectionStatus = CollectionStatus.APPROVED): Promise < NftEntity[] > {
        const nftFilterModel = new NftFilterModel();

        nftFilterModel.collectionStatus = [status];
        nftFilterModel.orderBy = NftOrderBy.TRENDING_DESC;
        nftFilterModel.from = 0;
        nftFilterModel.count = 10;

        const { nftEntities } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities;
    }

    async fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } > {
        try {
            this.disableActions?.();
            let fetchedNftsResult = await this.nftApi.fetchNftsByFilter(nftFilterModel);
            if (fetchedNftsResult.nftEntities.length === 0 && fetchedNftsResult.total !== 0) {
                if (nftFilterModel.goToLastPossbilePage(fetchedNftsResult.total) === true) {
                    fetchedNftsResult = await this.nftApi.fetchNftsByFilter(nftFilterModel);
                }
            }
            const checkedNfts = this.checkNftsVersusSessionStorage(fetchedNftsResult.nftEntities);

            return {
                nftEntities: checkedNfts,
                total: fetchedNftsResult.total,
            }
        } finally {
            this.enableActions?.();
        }
    }

    async buyNft(nftEntity: NftEntity, ledger: Ledger): Promise < string > {
        try {
            this.disableActions?.();
            const gasPrice = GasPrice.fromString(`${CHAIN_DETAILS.GAS_PRICE}${CHAIN_DETAILS.NATIVE_TOKEN_DENOM}`);
            const signingClient = await SigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS, ledger.offlineSigner, { gasPrice });
            let txHash = S.Strings.EMPTY;

            if (nftEntity.isMinted() === false) {
                const nftEntityResult = await this.nftApi.updateNftCudosPrice(nftEntity.id);
                nftEntity.copyDeepFrom(nftEntityResult);

                const mintFee = (new BigNumber(200000)).multipliedBy(CHAIN_DETAILS.GAS_PRICE);
                const amount = nftEntityResult.priceInAcudos.plus(mintFee);
                const sendAmountCoin = coin(amount.toFixed(0), 'acudos')
                const memo = new MintMemo(nftEntity.id, ledger.accountAddress).toJsonString();

                // sign transaction and send it to backend
                const tx = await signingClient.sendTokens(ledger.accountAddress, CHAIN_DETAILS.MINTING_SERVICE_ADDRESS, [sendAmountCoin], 'auto', memo);
                txHash = tx.transactionHash;

                // set tx hash in storage until processed by the observer
                this.nftSessionStorage.onNewPurchase(txHash);
            } else {
                const tx = await signingClient.marketplaceBuyNft(ledger.accountAddress, Long.fromString(nftEntity.marketplaceNftId), gasPrice);
                txHash = tx.transactionHash;
            }

            nftEntity.markAsMinted();
            nftEntity.setPricesZero();
            this.nftSessionStorage.updateNftsMap([nftEntity]);

            return txHash;
        } catch (ex) {
            console.log(ex);
            throw ex;
        } finally {
            this.enableActions?.();
        }
    }

    clearPurchaseTransactionsSessionStorage() {
        this.nftSessionStorage.clearPurchaseMap();
    }

    async buyPresaleNft(currency: BuyingCurrency, amount: BigNumber, ledger: Ledger): Promise < string > {
        try {
            this.disableActions?.();
            let txHash = S.Strings.EMPTY;

            // sign transaction and send it to backend
            if (currency === BuyingCurrency.ETH) {
                const web3 = new Web3(window.ethereum);

                const addresses = await web3.eth.getAccounts();

                const contract = new web3.eth.Contract(contractABI.abi, ETH_CONSTS.AURA_POOL_CONTRACT_ADDRESS, {
                    from: addresses[0],
                });

                const tx = await contract.methods.sendPayment(web3.utils.asciiToHex(ledger.accountAddress))
                    .send({
                        value: amount.shiftedBy(18).toFixed(0),
                    });

                if (!tx.transactionHash) {
                    throw Error(tx.message);
                }

                txHash = tx.transactionHash;
            } else if (currency === BuyingCurrency.CUDOS) {
                const gasPrice = GasPrice.fromString(`${CHAIN_DETAILS.GAS_PRICE}${CHAIN_DETAILS.NATIVE_TOKEN_DENOM}`);
                const signingClient = await SigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS, ledger.offlineSigner, { gasPrice });

                const mintFee = (new BigNumber(200000)).multipliedBy(CHAIN_DETAILS.GAS_PRICE);
                const sendAmountCoin = coin(amount.shiftedBy(CURRENCY_DECIMALS).plus(mintFee).toFixed(0), 'acudos')
                const memo = new MintMemo('presale', ledger.accountAddress).toJsonString();
                const tx = await signingClient.sendTokens(ledger.accountAddress, CHAIN_DETAILS.MINTING_SERVICE_ADDRESS, [sendAmountCoin], 'auto', memo);

                txHash = tx.transactionHash;
            }

            // set tx hash in storage until processed by the observer
            this.nftSessionStorage.onNewPurchase(txHash);

            return txHash;
        } catch (e) {
            console.log(e);
            throw e
        } finally {
            this.enableActions?.();
        }
    }

    async listNftForSale(nftEntity: NftEntity, collectionEntity: CollectionEntity, priceInCudos: BigNumber, ledger: Ledger): Promise < string > {
        try {
            this.disableActions?.();
            const signingClient = await SigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS, ledger.offlineSigner);
            const gasPrice = GasPrice.fromString(`${CHAIN_DETAILS.GAS_PRICE}${CHAIN_DETAILS.NATIVE_TOKEN_DENOM}`);

            const priceInAcudos = priceInCudos.shiftedBy(CURRENCY_DECIMALS);
            const tx = await signingClient.marketplacePublishNft(ledger.accountAddress, nftEntity.tokenId, collectionEntity.denomId, coin(priceInAcudos.toFixed(0), 'acudos'), gasPrice);
            const txHash = tx.transactionHash;

            const parsedRawLog = JSON.parse(tx.rawLog);
            const id = parsedRawLog[0]?.events[1]?.attributes?.find((a: any) => a.key === 'nft_id');

            await runInActionAsync(() => {
                nftEntity.marketplaceNftId = id?.value ?? '';
                nftEntity.priceInAcudos = priceInAcudos;
            })
            this.nftSessionStorage.updateNftsMap([nftEntity]);
            return txHash;
        } finally {
            this.enableActions?.();
        }
    }

    async editNftListing(nftEntity: NftEntity, priceInCudos: BigNumber, ledger: Ledger): Promise< string > {
        try {
            this.disableActions?.();
            const signingClient = await SigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS, ledger.offlineSigner);
            const gasPrice = GasPrice.fromString(`${CHAIN_DETAILS.GAS_PRICE}${CHAIN_DETAILS.NATIVE_TOKEN_DENOM}`);

            if (nftEntity.marketplaceNftId === '') {
                throw Error('NFT is not listed for sale yet. Please list it first.');
            }

            const priceInAcudos = priceInCudos.shiftedBy(CURRENCY_DECIMALS);

            const tx = await signingClient.marketplaceUpdatePrice(ledger.accountAddress, Long.fromString(nftEntity.marketplaceNftId), coin(priceInAcudos.toFixed(0), 'acudos'), gasPrice);
            const txHash = tx.transactionHash;

            await runInActionAsync(() => {
                nftEntity.priceInAcudos = priceInAcudos;
            });
            this.nftSessionStorage.updateNftsMap([nftEntity]);
            return txHash;
        } finally {
            this.enableActions?.();
        }
    }

    async cancelNftListing(nftEntity: NftEntity, ledger: Ledger): Promise< string > {
        try {
            this.disableActions?.();
            const signingClient = await SigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS, ledger.offlineSigner);
            const gasPrice = GasPrice.fromString(`${CHAIN_DETAILS.GAS_PRICE}${CHAIN_DETAILS.NATIVE_TOKEN_DENOM}`);

            if (nftEntity.marketplaceNftId === '') {
                throw Error('NFT is not listed for sale yet. Please list it first.');
            }

            const tx = await signingClient.marketplaceRemoveNft(ledger.accountAddress, Long.fromString(nftEntity.marketplaceNftId), gasPrice);
            const txHash = tx.transactionHash;

            await runInActionAsync(() => {
                nftEntity.marketplaceNftId = '';
                nftEntity.priceInAcudos = new BigNumber(0);
            });
            this.nftSessionStorage.updateNftsMap([nftEntity]);
            return txHash;
        } finally {
            this.enableActions?.();
        }
    }

    async mintNftsByGroup(nftGroup: NftGroup, collectionEntity: CollectionEntity, addressMintDataEntities: AddressMintDataEntity[], ledger: Ledger, cudosPriceInUsd: number): Promise < string > {
        try {
            this.disableActions?.();

            // const usdPriceInAcudos = new BigNumber(1).dividedBy(new BigNumber(cudosPriceInUsd)).shiftedBy(CURRENCY_DECIMALS);

            const gasPrice = GasPrice.fromString(`${CHAIN_DETAILS.GAS_PRICE}${CHAIN_DETAILS.NATIVE_TOKEN_DENOM}`);
            const signingClient = await SigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS, ledger.offlineSigner, { gasPrice });

            const nftFilter = new NftFilterModel();
            nftFilter.collectionIds = [collectionEntity.id];
            nftFilter.nftStatus = [NftStatus.QUEUED];
            // nftFilter.nftGroup = [NftGroup.GIVEAWAY, NftGroup.PRIVATE_SALE];
            nftFilter.nftGroup = [nftGroup];
            const { nftEntities } = await this.nftApi.fetchNftsByFilter(nftFilter);

            const tierMap = new Map<NftTier, NftEntity[]>();
            tierMap.set(NftTier.TIER_1, nftEntities.filter((entity) => entity.priceUsd === tierPriceMap.get(NftTier.TIER_1)));
            tierMap.set(NftTier.TIER_2, nftEntities.filter((entity) => entity.priceUsd === tierPriceMap.get(NftTier.TIER_2)));
            tierMap.set(NftTier.TIER_3, nftEntities.filter((entity) => entity.priceUsd === tierPriceMap.get(NftTier.TIER_3)));
            tierMap.set(NftTier.TIER_4, nftEntities.filter((entity) => entity.priceUsd === tierPriceMap.get(NftTier.TIER_4)));
            tierMap.set(NftTier.TIER_5, nftEntities.filter((entity) => entity.priceUsd === tierPriceMap.get(NftTier.TIER_5)));

            const msgs = [];
            for (let i = 0; i < addressMintDataEntities.length; i++) {
                const dataEntity = addressMintDataEntities[i];
                const receiverAddress = dataEntity.cudosAddress;

                for (let j = 0; j < dataEntity.nftMints.length; j++) {
                    const nftMint = dataEntity.nftMints[j];
                    const tier = nftMint.tier;

                    // left unminted nfts of that tier
                    const tierNftEntities = tierMap.get(tier).filter((entity) => entity.status === NftStatus.QUEUED);
                    if (tierNftEntities.length < nftMint.count) {
                        throw new Error('Not enough queued nfts.');
                    }

                    for (let k = 0; k < nftMint.count; k++) {
                        // mark it just for current purposes. Won't be saved in the DB
                        const nftEntity = tierNftEntities[k];
                        nftEntity.markAsMinted();

                        const { msg } = await signingClient.marketplaceModule.msgMintNft(
                            ledger.accountAddress,
                            collectionEntity.denomId,
                            receiverAddress,
                            // Coin.fromPartial({ denom: CHAIN_DETAILS.NATIVE_TOKEN_DENOM, amount: usdPriceInAcudos.multipliedBy(new BigNumber(nftEntity.priceUsd)).toFixed(0) }),
                            // 1acudos is set intentionally by CUDOS request
                            Coin.fromPartial({ denom: CHAIN_DETAILS.NATIVE_TOKEN_DENOM, amount: '1' }),
                            nftEntity.name,
                            nftEntity.imageUrl,
                            JSON.stringify({
                                'expiration_date': nftEntity.expirationDateTimestamp,
                                'hash_rate_owned': nftEntity.hashPowerInTh,
                            }),
                            nftEntity.id,
                            gasPrice,
                        )
                        msgs.push(msg);
                    }
                }
            }

            const tx = await signingClient.signAndBroadcast(ledger.accountAddress, msgs, 'auto');
            return tx.transactionHash;
        } finally {
            this.enableActions?.();
        }
    }

    private checkNftsVersusSessionStorage(nftEntities: NftEntity[]): NftEntity[] {
        const nftsMap = this.nftSessionStorage.getNftsMap();
        return nftEntities.map((nftEntity) => {
            const storageNft = nftsMap.get(nftEntity.id);
            if (storageNft !== undefined && nftEntity.updatedAt === storageNft.updatedAt) {
                return storageNft;
            }

            return nftEntity;
        })
    }

}
