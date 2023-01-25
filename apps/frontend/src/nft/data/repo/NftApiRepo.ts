import { CHAIN_DETAILS, ETH_CONSTS } from '../../../core/utilities/Constants';
import CollectionEntity, { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import NftEntity, { NftStatus } from '../../entities/NftEntity';
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

export default class NftApiRepo implements NftRepo {

    nftApi: NftApi;
    nftSessioNStorage: NftSessionStorage;

    enableActions: () => void;
    disableActions: () => void;
    showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void;

    constructor() {
        this.nftApi = new NftApi();
        this.nftSessioNStorage = new NftSessionStorage();

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

        const { nftEntities, total } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities;
    }

    async fetchNewNftDrops(status: CollectionStatus = CollectionStatus.APPROVED): Promise < NftEntity[] > {
        const nftFilterModel = new NftFilterModel();

        nftFilterModel.collectionStatus = [status];
        nftFilterModel.orderBy = NftOrderBy.TIMESTAMP_DESC;
        nftFilterModel.from = 0;
        nftFilterModel.count = 10;

        const { nftEntities, total } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities;
    }

    async fetchTrendingNfts(status: CollectionStatus = CollectionStatus.APPROVED): Promise < NftEntity[] > {
        const nftFilterModel = new NftFilterModel();

        nftFilterModel.collectionStatus = [status];
        nftFilterModel.orderBy = NftOrderBy.TRENDING_DESC;
        nftFilterModel.from = 0;
        nftFilterModel.count = 10;

        const { nftEntities, total } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities;
    }

    async fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } > {
        try {
            this.disableActions?.();
            const { nftEntities, total } = await this.nftApi.fetchNftsByFilter(nftFilterModel);
            const checkedNfts = this.checkNftsVersusSessionStorage(nftEntities);

            return {
                nftEntities: checkedNfts,
                total,
            }
        } finally {
            this.enableActions?.();
        }
    }

    async buyNft(currency: BuyingCurrency, nftEntity: NftEntity, ledger: Ledger): Promise < string > {
        try {
            this.disableActions?.();
            const gasPrice = GasPrice.fromString(`${CHAIN_DETAILS.GAS_PRICE}${CHAIN_DETAILS.NATIVE_TOKEN_DENOM}`);
            const signingClient = await SigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS, ledger.offlineSigner, { gasPrice });
            let txHash = S.Strings.EMPTY;

            if (nftEntity.isMinted() === false) {
                const acudosPrice = await this.nftApi.updateNftCudosPrice(nftEntity.id);
                const mintFee = (new BigNumber(200000)).multipliedBy(CHAIN_DETAILS.GAS_PRICE);
                const amount = acudosPrice.plus(mintFee);
                const sendAmountCoin = coin(amount.toFixed(0), 'acudos')
                const memo = `{"uuid":"${nftEntity.id}"}`;

                // sign transaction and send it to backend
                if (currency === BuyingCurrency.ETH) {
                    const web3 = new Web3(window.ethereum);

                    // Will open the MetaMask UI
                    const transactionParameters = {
                        nonce: '0x00', // ignored by MetaMask
                        gasPrice: '0x09184e72a000', // customizable by user during MetaMask confirmation.
                        gas: '0x2710', // customizable by user during MetaMask confirmation.
                        to: ETH_CONSTS.ETH_CUDOS_ADDRESS, // Required except during contract publications.
                        from: window.ethereum.selectedAddress, // must match user's active address.
                        value: web3.utils.fromWei(amount.shiftedBy(18).toString(10)), // Only required to send ether to the recipient from the initiating external account.
                        chainId: '0x3', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
                    };

                    const signedTx = await web3.eth.signTransaction(transactionParameters);
                    console.log('333333333333')

                    console.log(signedTx)
                    // this.nftApi
                    //     .txHash = tx.transactionHash;
                } else if (currency === BuyingCurrency.CUDOS) {
                    const tx = await signingClient.sendTokens(ledger.accountAddress, CHAIN_DETAILS.MINTING_SERVICE_ADDRESS, [sendAmountCoin], 'auto', memo);
                    txHash = tx.transactionHash;
                }
            } else {
                const tx = await signingClient.marketplaceBuyNft(ledger.accountAddress, Long.fromString(nftEntity.marketplaceNftId), gasPrice);
                txHash = tx.transactionHash;
            }

            nftEntity.markAsMinted();
            nftEntity.setPricesZero();
            this.nftSessioNStorage.updateNftsMap([nftEntity]);

            return txHash;
        } finally {
            this.enableActions?.();
        }
    }

    async listNftForSale(nftEntity: NftEntity, collectionEntity: CollectionEntity, priceInCudos: BigNumber, ledger: Ledger): Promise < string > {
        try {
            this.disableActions?.();
            const signingClient = await SigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS, ledger.offlineSigner);
            const gasPrice = GasPrice.fromString(`${CHAIN_DETAILS.GAS_PRICE}${CHAIN_DETAILS.NATIVE_TOKEN_DENOM}`);
            const tx = await signingClient.marketplacePublishNft(ledger.accountAddress, nftEntity.tokenId, collectionEntity.denomId, coin(priceInCudos.shiftedBy(CURRENCY_DECIMALS).toFixed(0), 'acudos'), gasPrice);
            const txHash = tx.transactionHash;

            nftEntity.priceInAcudos = priceInCudos;
            this.nftSessioNStorage.updateNftsMap([nftEntity]);
            return txHash;
        } finally {
            this.enableActions?.();
        }
    }

    private checkNftsVersusSessionStorage(nftEntities: NftEntity[]): NftEntity[] {
        const nftsMap = this.nftSessioNStorage.getNftsMap();
        return nftEntities.map((nftEntity) => {
            const storageNft = nftsMap.get(nftEntity.id);
            if (storageNft !== undefined && nftEntity.updatedAt === storageNft.updatedAt) {
                return storageNft;
            }

            return nftEntity;
        })
    }
}
