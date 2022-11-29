import S from '../../../../core/utilities/Main';
import { action, makeObservable, observable } from 'mobx';
import ModalStore from '../../../../core/presentation/stores/ModalStore';
import NftEntity from '../../entities/NftEntity';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';
import NftRepo from '../repos/NftRepo';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import AccountRepo from '../../../accounts/presentation/repos/AccountRepo';

export enum ModalStage {
    PREVIEW,
    PROCESSING,
    SUCCESS,
    FAIL
}

export default class BuyNftModalStore extends ModalStore {
    nftRepo: NftRepo;
    accountRepo: AccountRepo
    walletStore: WalletStore;

    @observable nftEntity: NftEntity;
    @observable cudosPrice: number;
    @observable recipient: string;
    @observable collectionName: string;
    @observable modalStage: ModalStage;
    @observable txHash: string;

    constructor(nftRepo: NftRepo, walletStore: WalletStore, accountRepo: AccountRepo) {
        super();

        this.nftRepo = nftRepo;
        this.accountRepo = accountRepo;

        this.walletStore = walletStore;

        this.resetValues();

        makeObservable(this);
    }

    resetValues() {
        this.cudosPrice = S.NOT_EXISTS;
        this.recipient = S.Strings.EMPTY;
        this.collectionName = S.Strings.EMPTY;
        this.modalStage = S.NOT_EXISTS;
        this.txHash = S.Strings.EMPTY;
    }

    nullateValues() {
        this.cudosPrice = null;
        this.recipient = null;
        this.collectionName = null;
        this.modalStage = null;
        this.txHash = null;
    }

    @action
    showSignal(nftEntity: NftEntity, cudosPrice: number, collectionName: string) {
        this.nftEntity = nftEntity;
        this.cudosPrice = cudosPrice;
        this.collectionName = collectionName;
        this.modalStage = ModalStage.PREVIEW;
        this.txHash = S.Strings.EMPTY;

        this.accountRepo.fetchBitcoinAddress(this.walletStore.address).then((btcAddress) => {
            this.recipient = btcAddress;
        });

        this.show();
    }

    hide = () => {
        this.nullateValues();
        super.hide();
    }

    setRecipient = (recipient: string) => {
        this.recipient = recipient;
    }

    buyNft = async () => {
        this.modalStage = ModalStage.PROCESSING;

        this.txHash = await this.nftRepo.buyNft(this.nftEntity, this.walletStore.ledger);

        this.modalStage = ModalStage.SUCCESS;
    }

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
