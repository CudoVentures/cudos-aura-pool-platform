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
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import { NftGroup } from '../../../nft/entities/NftEntity';

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
    @observable nftGroup: NftGroup;

    constructor(cudosRepo: CudosRepo, nftRepo: NftRepo, accountRepo: AccountRepo, alertStore: AlertStore, walletStore: WalletStore, cudosStore: CudosStore) {
        super();

        this.cudosRepo = cudosRepo;
        this.nftRepo = nftRepo;
        this.accountRepo = accountRepo;
        this.alertStore = alertStore;
        this.walletStore = walletStore;
        this.cudosStore = cudosStore;

        this.resetValues();

        makeObservable(this);
    }

    async init() {
        await this.cudosStore.init();
    }

    @action
    resetValues() {
        this.modalStage = ModalStage.UPLOAD_FILE;
        this.collectionEntity = null;
        this.addressMintDataEntities = null;
        this.txHash = '';
        this.nftGroup = NftGroup.GIVEAWAY;
    }

    showSignalForGiveawayNfts(collectionEntity: CollectionEntity) {
        this.showSignal(NftGroup.GIVEAWAY, collectionEntity);
    }

    showSignalForPrivateSaleNfts(collectionEntity: CollectionEntity) {
        this.showSignal(NftGroup.PRIVATE_SALE, collectionEntity);
    }

    @action
    showSignal(nftGroup: NftGroup, collectionEntity: CollectionEntity) {
        this.resetValues();

        this.nftGroup = nftGroup;
        this.collectionEntity = collectionEntity;

        this.show();
    }

    hide = action(() => {
        this.resetValues();
        super.hide();
    })

    async parseMintDataEntity(json) {
        const addressMintDataEntities = json.addressMints.map((addressMintJson) => AddressMintDataEntity.fromJson(addressMintJson));

        if (addressMintDataEntities === null && addressMintDataEntities.length === 0) {
            throw Error('Invalid JSON');
        }

        // const addressMintDataAddressMapping = new Map();
        // addressMintDataEntities.forEach((addressMintDataEntity) => {
        //     const mappedAddress = addressMintDataAddressMapping.get(addressMintDataEntity.cudosAddress);
        //     if (mappedAddress === undefined) {
        //         addressMintDataAddressMapping.set(addressMintDataEntity.cudosAddress, addressMintDataEntity.btcAddress);
        //     } else if (mappedAddress !== addressMintDataEntity.btcAddress) {
        //         throw Error(`Address ${addressMintDataEntity.cudosAddress} has more than single BTC wallet address - ${addressMintDataEntity.btcAddress} and ${mappedAddress}`);
        //     }
        // })

        // // check if any addresses are not present in the addressbook
        // const bitcoinPayoutAddressesMap = await this.cudosRepo.fetchBitcoinPayoutAddresses(addressMintDataEntities.map((addressMintDataEntity) => addressMintDataEntity.cudosAddress));
        // const missingCudosAddressedInAddressBookSet = new Set();
        // bitcoinPayoutAddressesMap.forEach((btcAddress, cudosAddress) => {
        //     if (BitcoinStore.isValidBtcAddress(btcAddress) === false || addressMintDataAddressMapping.get(cudosAddress) !== btcAddress) {
        //         missingCudosAddressedInAddressBookSet.add(cudosAddress);
        //     }
        // });

        // if (missingCudosAddressedInAddressBookSet.size > 0) {
        //     throw Error(`The following addresses are missing/invalid (or with different BTC address) in the addressbook: ${Array.from(missingCudosAddressedInAddressBookSet).join(', ')}`);
        // }

        await runInActionAsync(() => {
            this.addressMintDataEntities = addressMintDataEntities;
            this.modalStage = ModalStage.PREVIEW;
        });
    }

    onClickSubmitForSell = action(async () => {
        this.modalStage = ModalStage.PROCESSING;

        try {
            await this.accountRepo.createPresaleAccounts(this.addressMintDataEntities);
            this.txHash = await this.nftRepo.mintNftsByGroup(this.nftGroup, this.collectionEntity, this.addressMintDataEntities, this.walletStore.ledger, this.cudosStore.getCudosPriceInUsd());

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
