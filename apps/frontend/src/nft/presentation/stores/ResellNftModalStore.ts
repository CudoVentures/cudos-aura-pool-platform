import S from '../../../core/utilities/Main';
import { action, makeObservable, observable } from 'mobx';
import ModalStore from '../../../core/presentation/stores/ModalStore';
import NftEntity from '../../entities/NftEntity';
import { CHAIN_DETAILS } from '../../../core/utilities/Constants';
import NftRepo from '../repos/NftRepo';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import BigNumber from 'bignumber.js';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';

export enum ModalType {
    RESELL = '1',
    EDIT_RESELL = '2',
    CANCEL_RESELL = '3',
}

export enum ModalStage {
    PREVIEW,
    PROCESSING,
    SUCCESS,
    FAIL
}

export default class ResellNftModalStore extends ModalStore {
    nftRepo: NftRepo;
    walletStore: WalletStore;
    cudosStore: CudosStore;

    @observable nftEntity: NftEntity;
    @observable cudosPriceUsd: number;
    nftPriceInUsd: BigNumber;
    @observable priceDisplay: string;
    @observable collectionEntity: CollectionEntity;
    @observable miningFarmEntity: MiningFarmEntity;
    @observable modalStage: ModalStage;
    @observable originalPaymentSchedule: number;
    @observable autoPay: number;
    @observable txHash: string;
    @observable modalType: ModalType;

    constructor(nftRepo: NftRepo, walletStore: WalletStore, cudosStore: CudosStore) {
        super();

        this.nftRepo = nftRepo;
        this.cudosStore = cudosStore;
        this.walletStore = walletStore;

        this.resetValues();

        makeObservable(this);
    }

    @action
    resetValues() {
        this.nftEntity = null;
        this.collectionEntity = null;
        this.miningFarmEntity = null;
        this.cudosPriceUsd = S.NOT_EXISTS;
        this.nftPriceInUsd = new BigNumber(0);
        this.priceDisplay = S.Strings.EMPTY;
        this.modalStage = ModalStage.PREVIEW;
        this.autoPay = S.INT_FALSE;
        this.originalPaymentSchedule = S.INT_FALSE;
        this.txHash = S.Strings.EMPTY;
        this.modalType = ModalType.RESELL;
    }

    @action
    nullateValues() {
        this.nftEntity = null;
        this.collectionEntity = null;
        this.miningFarmEntity = null;
        this.cudosPriceUsd = null;
        this.nftPriceInUsd = null;
        this.priceDisplay = null;
        this.modalStage = null;
        this.autoPay = null;
        this.originalPaymentSchedule = null;
        this.txHash = null;
        this.modalType = null;
    }

    @action
    showSignal(mdoalType: ModalType, nftEntity: NftEntity, cudosPriceUsd: number, collectionEntity: CollectionEntity, miningFarmEntity: MiningFarmEntity) {
        this.resetValues();
        this.nftEntity = nftEntity;
        if (nftEntity.priceInAcudos.gt(0)) {
            this.priceDisplay = this.cudosStore.convertAcudosInUsd(nftEntity.priceInAcudos).toFixed(2);
        }

        this.cudosPriceUsd = cudosPriceUsd;
        this.collectionEntity = collectionEntity;
        this.miningFarmEntity = miningFarmEntity;
        this.modalType = mdoalType;
        this.show();
    }

    hide = action(() => {
        this.nullateValues();
        super.hide();
    })

    setPrice = action((nftPriceInUsd: string) => {
        this.priceDisplay = nftPriceInUsd;
        this.nftPriceInUsd = new BigNumber(nftPriceInUsd);
    })

    toggleAutoPay = action(() => {
        this.autoPay = this.autoPay === S.INT_TRUE ? S.INT_FALSE : S.INT_TRUE;
    })

    toggleOriginalPaymentSchedule = action(() => {
        this.originalPaymentSchedule = this.originalPaymentSchedule === S.INT_TRUE ? S.INT_FALSE : S.INT_TRUE;
    })

    async onClickSubmitForSell() {
        this.runTransaction(() => this.nftRepo.listNftForSale(this.nftEntity, this.collectionEntity, this.getResellPriceInCudos(), this.walletStore.ledger));
    }

    async onClickSaveEditListing() {
        this.runTransaction(() => this.nftRepo.editNftListing(this.nftEntity, this.getResellPriceInCudos(), this.walletStore.ledger));
    }

    async onClickCancelListing() {
        this.runTransaction(() => this.nftRepo.cancelNftListing(this.nftEntity, this.walletStore.ledger));
    }

    @action
    private async runTransaction(txCall: () => Promise<string>) {
        this.modalStage = ModalStage.PROCESSING;

        try {
            this.txHash = await txCall();

            await runInActionAsync(() => {
                this.modalStage = ModalStage.SUCCESS;
            });
        } catch (ex) {
            await runInActionAsync(() => {
                this.modalStage = ModalStage.FAIL;
            });
        }
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
        return `${CHAIN_DETAILS.EXPLORER_URL}/transactions/${this.txHash}`
    }

    getResellpriceInCudosDisplay(): string {
        return this.getResellPriceInCudos().toFixed(2);
    }

    getResellPriceInCudos(): BigNumber {
        return this.nftPriceInUsd.dividedBy(this.cudosPriceUsd);
    }

    getModelWindowName(): string {
        switch (this.modalType) {
            case ModalType.RESELL:
                return 'Resell NFT';
            case ModalType.EDIT_RESELL:
                return 'Edit Listing';
            case ModalType.CANCEL_RESELL:
                return 'Cancel Listing';
            default:
                return '';
        }
    }

    shouldShowPriceInput(): boolean {
        return this.isTypeResell() || this.isTypeEditResell();
    }

    isTypeResell(): boolean {
        return this.modalType === ModalType.RESELL;
    }

    isTypeEditResell(): boolean {
        return this.modalType === ModalType.EDIT_RESELL;
    }

    isTypeCancelResell(): boolean {
        return this.modalType === ModalType.CANCEL_RESELL;
    }

    setModalTypeCancel = action(() => { this.modalType = ModalType.CANCEL_RESELL });

}
