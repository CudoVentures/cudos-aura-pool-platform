import S from '../../../core/utilities/Main';
import { action, makeObservable, observable, runInAction } from 'mobx';
import ModalStore from '../../../core/presentation/stores/ModalStore';
import NftEntity from '../../entities/NftEntity';
import { CHAIN_DETAILS, getEthChainEtherscanLink } from '../../../core/utilities/Constants';
import NftRepo, { BuyingCurrency } from '../repos/NftRepo';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import AccountRepo from '../../../accounts/presentation/repos/AccountRepo';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import CudosRepo from '../../../cudos-data/presentation/repos/CudosRepo';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';

export enum ModalStage {
    PREVIEW,
    PROCESSING,
    SUCCESS,
    FAIL
}

export default class BuyNftModalStore extends ModalStore {
    cudosStore: CudosStore;

    nftRepo: NftRepo;
    accountRepo: AccountRepo;
    cudosRepo: CudosRepo;
    walletStore: WalletStore;

    @observable currency: BuyingCurrency;
    @observable nftEntity: NftEntity;
    @observable cudosPrice: number;
    @observable recipient: string;
    @observable collectionEntity: CollectionEntity;
    @observable modalStage: ModalStage;
    @observable txHash: string;

    constructor(cudosStore: CudosStore, nftRepo: NftRepo, walletStore: WalletStore, accountRepo: AccountRepo, cudosRepo: CudosRepo) {
        super();

        this.cudosStore = cudosStore;
        this.nftRepo = nftRepo;
        this.accountRepo = accountRepo;
        this.cudosRepo = cudosRepo;

        this.walletStore = walletStore;

        this.resetValues();

        makeObservable(this);
    }

    @action
    resetValues() {
        this.currency = BuyingCurrency.CUDOS;
        this.nftEntity = null;
        this.collectionEntity = null;
        this.cudosPrice = S.NOT_EXISTS;
        this.recipient = S.Strings.EMPTY;
        this.modalStage = S.NOT_EXISTS;
        this.txHash = S.Strings.EMPTY;
    }

    @action
    nullateValues() {
        this.currency = null;
        this.nftEntity = null;
        this.collectionEntity = null;
        this.cudosPrice = null;
        this.recipient = null;
        this.modalStage = null;
        this.txHash = null;
    }

    async showSignal(currency: BuyingCurrency, nftEntity: NftEntity, cudosPrice: number, collectionEntity: CollectionEntity) {
        const recipient = await this.cudosRepo.fetchBitcoinPayoutAddress(this.walletStore.getAddress());
        this.cudosStore.init();
        this.currency = currency;

        runInAction(() => {
            this.nftEntity = nftEntity;
            this.cudosPrice = cudosPrice;
            this.collectionEntity = collectionEntity;
            this.modalStage = ModalStage.PREVIEW;
            this.txHash = S.Strings.EMPTY;

            this.recipient = recipient;

            this.show();
        });
    }

    hide = action(() => {
        this.nullateValues();
        super.hide();
    })

    buyNft = action(async () => {
        this.modalStage = ModalStage.PROCESSING;

        try {
            this.txHash = await this.nftRepo.buyNft(this.currency, this.nftEntity, this.walletStore.ledger);

            await runInActionAsync(() => {
                this.modalStage = ModalStage.SUCCESS;
            });
        } catch (ex) {
            await runInActionAsync(() => {
                this.modalStage = ModalStage.FAIL;
            });
        }
    })

    getTxLink(): string {
        if (this.currency === BuyingCurrency.CUDOS) {
            return `${CHAIN_DETAILS.EXPLORER_URL}/transactions/${this.txHash}`;
        }

        if (this.currency === BuyingCurrency.ETH) {
            return `https://${getEthChainEtherscanLink()}tx/${this.txHash}`;
        }

        return '';
    }

    isStagePreview(): boolean {
        return this.modalStage === ModalStage.PREVIEW;
    }

    isStageProcessing(): boolean {
        return this.modalStage === ModalStage.PROCESSING;
    }

    isStageSuccess(): boolean {
        return this.modalStage === ModalStage.SUCCESS;
    }

    isStageFail(): boolean {
        return this.modalStage === ModalStage.FAIL;
    }

    formatPricePlusMintFeeInCudos(): string {
        const price = this.cudosStore.getNftCudosPriceForNft(this.nftEntity).plus(1);

        return `${price.toFixed(2)} CUDOS`;
    }

    formatPricePlusMintFeeInUsd(): string {
        const priceCudos = this.cudosStore.getNftCudosPriceForNft(this.nftEntity).plus(1);

        return this.cudosStore.formatCudosInUsd(priceCudos);
    }
}
