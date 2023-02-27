import { action, makeObservable, observable } from 'mobx';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import ModalStore from '../../../core/presentation/stores/ModalStore';
import { CHAIN_DETAILS } from '../../../core/utilities/Constants';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import AddressMintDataEntity from '../../entities/AddressMintDataEntity';

export enum ModalStage {
    UPLOAD_FILE,
    PREVIEW,
    PROCESSING,
    SUCCESS,
    FAIL
}

export default class MintPrivateSaleNftModalStore extends ModalStore {
    nftRepo: NftRepo;
    alertStore: AlertStore;
    walletStore: WalletStore;

    collectionEntity: CollectionEntity;
    addressMintDataEntities: AddressMintDataEntity[];
    @observable modalStage: ModalStage;
    @observable txHash: string;

    constructor(nftRepo: NftRepo, alertStore: AlertStore, walletStore: WalletStore) {
        super();

        this.nftRepo = nftRepo;
        this.modalStage = null;
        this.alertStore = alertStore;
        this.walletStore = walletStore;
        this.collectionEntity = null;
        this.addressMintDataEntities = null;

        this.txHash = null;
        this.resetValues();

        makeObservable(this);
    }

    @action
    resetValues() {
        this.modalStage = ModalStage.UPLOAD_FILE;
        this.txHash = '';
    }

    @action
    nullateValues() {
        this.modalStage = null;
        this.collectionEntity = null;
        this.addressMintDataEntities = null;
        this.txHash = null;
    }

    @action
    showSignal(collectionEntity: CollectionEntity) {
        this.resetValues();

        this.collectionEntity = collectionEntity;

        this.show();
    }

    hide = action(() => {
        this.nullateValues();
        super.hide();
    })

    @action
    parseMintDataEntity(json) {
        const addressMintDataEntities = json.addressMints.map((addressMintJson) => AddressMintDataEntity.fromJson(addressMintJson));

        if (addressMintDataEntities === null && addressMintDataEntities.length === 0) {
            this.alertStore.show('Invalid JSON.');
            return;
        }

        this.addressMintDataEntities = addressMintDataEntities;
        this.modalStage = ModalStage.PREVIEW;
    }

    onClickSubmitForSell = action(async () => {
        this.modalStage = ModalStage.PROCESSING;

        try {
            this.txHash = await this.nftRepo.mintPresaleNfts(this.collectionEntity, this.addressMintDataEntities, this.walletStore.ledger);

            await runInActionAsync(() => {
                this.modalStage = ModalStage.SUCCESS;
            });
        } catch (ex) {
            this.alertStore.show(ex.message);
            await runInActionAsync(() => {
                this.modalStage = ModalStage.FAIL;
            });
        }
    })

    isStageUploadFile(): boolean {
        return this.modalStage === ModalStage.UPLOAD_FILE;
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
}
