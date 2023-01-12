import S from '../../../core/utilities/Main';
import { action, makeObservable, observable, runInAction } from 'mobx';
import ModalStore from '../../../core/presentation/stores/ModalStore';
import NftEntity from '../../entities/NftEntity';
import { CHAIN_DETAILS } from '../../../core/utilities/Constants';
import NftRepo from '../repos/NftRepo';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import AccountRepo from '../../../accounts/presentation/repos/AccountRepo';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import CudosRepo from '../../../cudos-data/presentation/repos/CudosRepo';

export enum ModalStage {
    PREVIEW,
    PROCESSING,
    SUCCESS,
    FAIL
}

export default class BuyNftModalStore extends ModalStore {
    nftRepo: NftRepo;
    accountRepo: AccountRepo;
    cudosRepo: CudosRepo;
    walletStore: WalletStore;

    @observable nftEntity: NftEntity;
    @observable cudosPrice: number;
    @observable recipient: string;
    @observable collectionEntity: CollectionEntity;
    @observable modalStage: ModalStage;
    @observable txHash: string;

    constructor(nftRepo: NftRepo, walletStore: WalletStore, accountRepo: AccountRepo, cudosRepo: CudosRepo) {
        super();

        this.nftRepo = nftRepo;
        this.accountRepo = accountRepo;
        this.cudosRepo = cudosRepo;

        this.walletStore = walletStore;

        this.resetValues();

        makeObservable(this);
    }

    resetValues() {
        this.nftEntity = null;
        this.collectionEntity = null;
        this.cudosPrice = S.NOT_EXISTS;
        this.recipient = S.Strings.EMPTY;
        this.modalStage = S.NOT_EXISTS;
        this.txHash = S.Strings.EMPTY;
    }

    nullateValues() {
        this.nftEntity = null;
        this.collectionEntity = null;
        this.cudosPrice = null;
        this.recipient = null;
        this.modalStage = null;
        this.txHash = null;
    }

    async showSignal(nftEntity: NftEntity, cudosPrice: number, collectionEntity: CollectionEntity) {
        const recipient = await this.cudosRepo.fetchBitcoinPayoutAddress(this.walletStore.getAddress());

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

    setRecipient = action((recipient: string) => {
        this.recipient = recipient;
    })

    buyNft = action(async () => {
        this.modalStage = ModalStage.PROCESSING;

        this.txHash = await this.nftRepo.buyNft(this.nftEntity, this.walletStore.ledger);

        runInAction(() => {
            this.modalStage = ModalStage.SUCCESS;
        })
    })

    getTxLink(): string {
        return `${CHAIN_DETAILS.EXPLORER_URL}/${this.txHash}`
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
}
