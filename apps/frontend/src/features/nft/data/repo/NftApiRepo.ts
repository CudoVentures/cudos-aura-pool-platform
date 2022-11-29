import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';
import { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import NftEntity, { ListStatus, NftStatus } from '../../entities/NftEntity';
import NftRepo from '../../presentation/repos/NftRepo';
import NftFilterModel, { NftOrderBy } from '../../utilities/NftFilterModel';
import NftApi from '../data-sources/NftApi';
import { SigningStargateClient, GasPrice, Ledger } from 'cudosjs';
import Long from 'long';
import S from '../../../../core/utilities/Main';
import BigNumber from 'bignumber.js';
import { coin } from 'cudosjs/build/proto-signing';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';

export default class NftApiRepo implements NftRepo {

    nftApi: NftApi;
    enableActions: () => void;
    disableActions: () => void;

    constructor() {
        this.nftApi = new NftApi();
        this.enableActions = null;
        this.disableActions = null;
    }

    setPresentationCallbacks(enableActions: () => void, disableActions: () => void) {
        this.enableActions = enableActions;
        this.disableActions = disableActions;
    }

    async fetchNftById(nftId: string, status: CollectionStatus = CollectionStatus.APPROVED): Promise < NftEntity > {
        const nftEntities = await this.fetchNftByIds([nftId], status);
        return nftEntities.length === 1 ? nftEntities[0] : null;
    }

    async fetchNftByIds(nftIds: string[], status: CollectionStatus = CollectionStatus.APPROVED): Promise < NftEntity[] > {
        const nftFilterModel = new NftFilterModel();
        nftFilterModel.nftIds = nftIds;
        nftFilterModel.collectionStatus = status;

        const { nftEntities, total } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities;
    }

    async fetchNewNftDrops(status: CollectionStatus = CollectionStatus.APPROVED): Promise < NftEntity[] > {
        const nftFilterModel = new NftFilterModel();

        nftFilterModel.collectionStatus = status;
        nftFilterModel.orderBy = NftOrderBy.TIMESTAMP_DESC;

        const { nftEntities, total } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities;
    }

    async fetchTrendingNfts(status: CollectionStatus = CollectionStatus.APPROVED): Promise < NftEntity[] > {
        const nftFilterModel = new NftFilterModel();

        nftFilterModel.collectionStatus = status;
        nftFilterModel.orderBy = NftOrderBy.TRENDING_DESC;

        const { nftEntities, total } = await this.fetchNftsByFilter(nftFilterModel);
        return nftEntities;
    }

    async fetchNftsByFilter(nftFilterModel: NftFilterModel): Promise < { nftEntities: NftEntity[], total: number } > {
        try {
            this.disableActions?.();
            return this.nftApi.fetchNftsByFilter(nftFilterModel);
        } finally {
            this.enableActions?.();
        }
    }

    async buyNft(nftEntity: NftEntity, ledger: Ledger): Promise < string > {
        try {
            this.disableActions?.();

            const signingClient = await SigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS, ledger.offlineSigner);
            const gasPrice = GasPrice.fromString(CHAIN_DETAILS.GAS_PRICE);
            let txHash = S.Strings.EMPTY;

            if (nftEntity.status === NftStatus.QUEUED) {
                // TODO:get real tx estimation
                const mintFee = (new BigNumber(200000)).multipliedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER);
                const amount = nftEntity.priceInAcudos.plus(mintFee);
                const sendAmountCoin = coin(amount.toFixed(), 'acudos')
                const tx = await signingClient.sendTokens(ledger.accountAddress, CHAIN_DETAILS.MINTING_SERVICE_ADDRESS, sendAmountCoin, nftEntity.id);
                txHash = tx.transactionHash;
            }

            if (nftEntity.status === NftStatus.MINTED) {
                const tx = await signingClient.marketplaceBuyNft(ledger.accountAddress, Long.fromString(nftEntity.id), gasPrice);
                txHash = tx.transactionHash;
            }

            return txHash;
        } finally {
            this.enableActions?.();
        }
    }

    async listNftForSale(nftEntity: NftEntity, price: BigNumber, ledger: Ledger): Promise < string > {
        try {
            this.disableActions?.();

            const signingClient = await SigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS, ledger.offlineSigner);
            const gasPrice = GasPrice.fromString(CHAIN_DETAILS.GAS_PRICE);

            const tx = await signingClient.marketplacePublishNft(ledger.accountAddress, Long.fromString(nftEntity.id), Long.fromString(nftEntity.collectionId), coin(price.multipliedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER).toFixed(), 'acudos'), gasPrice);
            const txHash = tx.transactionHash;

            return txHash;
        } finally {
            this.enableActions?.();
        }
    }
}
