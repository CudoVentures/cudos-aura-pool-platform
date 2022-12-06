import S from '../../../../core/utilities/Main';
import { action, makeObservable, observable } from 'mobx';
import ModalStore from '../../../../core/presentation/stores/ModalStore';
import NftEntity from '../../entities/NftEntity';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';
import NftRepo from '../repos/NftRepo';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import BigNumber from 'bignumber.js';
import CollectionEntity from '../../../collection/entities/CollectionEntity';

export enum ModalStage {
    PREVIEW,
    PROCESSING,
    SUCCESS,
    FAIL
}

export default class ResellNftModalStore extends ModalStore {
    nftRepo: NftRepo;
    walletStore: WalletStore;

    @observable nftEntity: NftEntity;
    @observable cudosPrice: number;
    price: BigNumber;
    @observable priceDisplay: string;
    @observable collectionEntity: CollectionEntity;
    @observable modalStage: ModalStage;
    @observable originalPaymentSchedule: number;
    @observable autoPay: number;
    txHash: string;

    constructor(nftRepo: NftRepo, walletStore: WalletStore) {
        super();

        this.nftRepo = nftRepo;
        this.walletStore = walletStore;

        this.resetValues();

        makeObservable(this);
    }

    resetValues() {
        this.nftEntity = null;
        this.collectionEntity = null;
        this.cudosPrice = S.NOT_EXISTS;
        this.price = new BigNumber(S.NOT_EXISTS);
        this.priceDisplay = S.Strings.EMPTY;
        this.modalStage = S.NOT_EXISTS;
        this.autoPay = S.INT_FALSE;
        this.originalPaymentSchedule = S.INT_FALSE;
        this.txHash = S.Strings.EMPTY;
    }

    nullateValues() {
        this.nftEntity = null;
        this.collectionEntity = null;
        this.cudosPrice = null;
        this.price = null;
        this.priceDisplay = null;
        this.modalStage = null;
        this.autoPay = null;
        this.originalPaymentSchedule = null;
        this.txHash = null;
    }

    @action
    showSignal(nftEntity: NftEntity, cudosPrice: number, collectionEntity: CollectionEntity) {
        this.nftEntity = nftEntity;
        this.cudosPrice = cudosPrice;
        this.collectionEntity = collectionEntity;
        this.modalStage = ModalStage.PREVIEW;
        this.price = new BigNumber(0);
        this.priceDisplay = '0';
        this.autoPay = S.INT_FALSE;
        this.originalPaymentSchedule = S.INT_FALSE;

        this.show();
    }

    hide = () => {
        this.nullateValues();
        super.hide();
    }

    setPrice = (price: string) => {
        this.priceDisplay = price;
        this.price = new BigNumber(price);
    }

    toggleAutoPay = () => {
        this.autoPay = this.autoPay === S.INT_TRUE ? S.INT_FALSE : S.INT_TRUE;
    }

    toggleOriginalPaymentSchedule = () => {
        this.originalPaymentSchedule = this.originalPaymentSchedule === S.INT_TRUE ? S.INT_FALSE : S.INT_TRUE;
    }

    onClickSubmitForSell = async () => {
        this.modalStage = ModalStage.PROCESSING;
        this.txHash = await this.nftRepo.listNftForSale(this.nftEntity, this.collectionEntity, this.price, this.walletStore.ledger);

        this.modalStage = ModalStage.SUCCESS;
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

    getTxLink(): string {
        return `${CHAIN_DETAILS.EXPLORER_URL}/${this.txHash}`
    }

}
