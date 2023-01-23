import { CHAIN_DETAILS } from '../../../core/utilities/Constants';
import CollectionEntity, { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import NftEntity, { NftStatus } from '../../entities/NftEntity';
import NftRepo from '../../presentation/repos/NftRepo';
import NftFilterModel, { NftOrderBy } from '../../utilities/NftFilterModel';
import NftApi from '../data-sources/NftApi';
import { SigningStargateClient, GasPrice, Ledger, Ui64, CURRENCY_DECIMALS } from 'cudosjs';
import Long from 'long';
import S from '../../../core/utilities/Main';
import BigNumber from 'bignumber.js';
import { coin } from 'cudosjs/build/proto-signing';

export default class NftApiRepo implements NftRepo {

    nftApi: NftApi;
    enableActions: () => void;
    disableActions: () => void;
    showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void;

    constructor() {
        this.nftApi = new NftApi();
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
            return await this.nftApi.fetchNftsByFilter(nftFilterModel);
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
                const mintFee = (new BigNumber(200000)).multipliedBy(CHAIN_DETAILS.GAS_PRICE);
                const amount = nftEntity.priceInAcudos.plus(mintFee);
                const sendAmountCoin = coin(amount.toFixed(), 'acudos')
                const memo = `{"uuid":"${nftEntity.id}"}`;

                const tx = await signingClient.sendTokens(ledger.accountAddress, CHAIN_DETAILS.MINTING_SERVICE_ADDRESS, [sendAmountCoin], 'auto', memo);
                txHash = tx.transactionHash;
            }

            if (nftEntity.status === NftStatus.MINTED) {
                const tx = await signingClient.marketplaceBuyNft(ledger.accountAddress, Long.fromString(nftEntity.marketplaceNftId), gasPrice);
                txHash = tx.transactionHash;
            }

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

            return txHash;
        } finally {
            this.enableActions?.();
        }
    }
}
