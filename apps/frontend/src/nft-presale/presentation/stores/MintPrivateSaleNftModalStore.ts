import { action, makeObservable, observable, runInAction } from 'mobx';
import AccountRepo from '../../../accounts/presentation/repos/AccountRepo';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import ModalStore from '../../../core/presentation/stores/ModalStore';
import { CHAIN_DETAILS } from '../../../core/utilities/Constants';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import CudosRepo from '../../../cudos-data/presentation/repos/CudosRepo';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
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
    alertStore: AlertStore;
    walletStore: WalletStore;
    cudosStore: CudosStore;

    cudosRepo: CudosRepo;
    nftRepo: NftRepo;
    accountRepo: AccountRepo;

    collectionEntity: CollectionEntity;
    addressMintDataEntities: AddressMintDataEntity[];
    @observable modalStage: ModalStage;
    @observable txHash: string;

    constructor(cudosRepo: CudosRepo, nftRepo: NftRepo, accountRepo: AccountRepo, alertStore: AlertStore, walletStore: WalletStore, cudosStore: CudosStore) {
        super();

        this.cudosRepo = cudosRepo;
        this.nftRepo = nftRepo;
        this.accountRepo = accountRepo;
        this.modalStage = null;
        this.alertStore = alertStore;
        this.walletStore = walletStore;
        this.cudosStore = cudosStore;
        this.collectionEntity = null;
        this.addressMintDataEntities = null;

        this.txHash = null;
        this.resetValues();

        makeObservable(this);
    }

    async init() {
        await this.cudosStore.init();
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

    async parseMintDataEntity(json) {
        const addressMintDataEntities = json.addressMints.map((addressMintJson) => AddressMintDataEntity.fromJson(addressMintJson));

        if (addressMintDataEntities === null && addressMintDataEntities.length === 0) {
            throw Error('Invalid JSON');
        }

        // check if any addresses are not present in the addressbook
        const bitcoinPayoutAddresses = await this.cudosRepo.fetchBitcoinPayoutAddresses(addressMintDataEntities.map((addressMintDataEntity) => addressMintDataEntity.cudosAddress));
        const bitcoinPayoutAddressesMap = new Map<string, string>();
        bitcoinPayoutAddresses.forEach((bitcoinPayoutAddress, index) => {
            bitcoinPayoutAddressesMap.set(addressMintDataEntities[index].cudosAddress, bitcoinPayoutAddress);
        });

        const missingCudosAddressesInAddressbook = [];
        addressMintDataEntities.forEach((addressMintDataEntity) => {
            if (bitcoinPayoutAddressesMap.get(addressMintDataEntity.cudosAddress) !== addressMintDataEntity.btcAddress) {
                missingCudosAddressesInAddressbook.push(addressMintDataEntity.cudosAddress);
            }
        });

        if (missingCudosAddressesInAddressbook.length > 0) {
            throw Error(`The following addresses are missing (or with different BTC address) in the addressbook: ${missingCudosAddressesInAddressbook.join(', ')}`);
        }

        await runInActionAsync(() => {
            this.addressMintDataEntities = addressMintDataEntities;
            this.modalStage = ModalStage.PREVIEW;
        });
    }

    onClickSubmitForSell = action(async () => {
        this.modalStage = ModalStage.PROCESSING;

        try {
            await this.accountRepo.createPresaleAccounts(this.addressMintDataEntities);
            this.txHash = await this.nftRepo.mintPresaleNfts(this.collectionEntity, this.addressMintDataEntities, this.walletStore.ledger, this.cudosStore.getCudosPriceInUsd());

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
