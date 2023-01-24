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
    @observable cudosPriceUsd: number;
    nftPriceInUsd: BigNumber;
    @observable priceDisplay: string;
    @observable collectionEntity: CollectionEntity;
    @observable modalStage: ModalStage;
    @observable originalPaymentSchedule: number;
    @observable autoPay: number;
    @observable txHash: string;

    constructor(nftRepo: NftRepo, walletStore: WalletStore) {
        super();

        this.nftRepo = nftRepo;
        this.walletStore = walletStore;

        this.resetValues();

        makeObservable(this);
    }

    @action
    resetValues() {
        this.nftEntity = null;
        this.collectionEntity = null;
        this.cudosPriceUsd = S.NOT_EXISTS;
        this.nftPriceInUsd = new BigNumber(0);
        this.priceDisplay = S.Strings.EMPTY;
        this.modalStage = ModalStage.PREVIEW;
        this.autoPay = S.INT_FALSE;
        this.originalPaymentSchedule = S.INT_FALSE;
        this.txHash = S.Strings.EMPTY;
    }

    @action
    nullateValues() {
        this.nftEntity = null;
        this.collectionEntity = null;
        this.cudosPriceUsd = null;
        this.nftPriceInUsd = null;
        this.priceDisplay = null;
        this.modalStage = null;
        this.autoPay = null;
        this.originalPaymentSchedule = null;
        this.txHash = null;
    }

    @action
    showSignal(nftEntity: NftEntity, cudosPriceUsd: number, collectionEntity: CollectionEntity) {
        this.resetValues();
        this.nftEntity = nftEntity;
        this.cudosPriceUsd = cudosPriceUsd;
        this.collectionEntity = collectionEntity;
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

    onClickSubmitForSell = action(async () => {
        this.modalStage = ModalStage.PROCESSING;

        try {
            this.txHash = await this.nftRepo.listNftForSale(this.nftEntity, this.collectionEntity, this.getResellPriceInCudos(), this.walletStore.ledger);

            await runInActionAsync(() => {
                this.modalStage = ModalStage.SUCCESS;
            });
        } catch (ex) {
            await runInActionAsync(() => {
                this.modalStage = ModalStage.FAIL;
            });
        }
    })

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

}
