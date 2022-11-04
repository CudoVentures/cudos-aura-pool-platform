import S from '../../../../core/utilities/Main';
import { makeAutoObservable, runInAction } from 'mobx';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionRepo from '../repos/CollectionRepo';
import BigNumber from 'bignumber.js';
import NftEntity from '../../../nft/entities/NftEntity';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import TempIdGenerator from '../../../../core/utilities/TempIdGenerator';

enum CreditCollectionDetailsSteps {
    COLLECTION_DETAILS = 1,
    ADD_NFTS = 2,
    FINISH = 3,
}

enum CreditCollectionMode {
    CREATE = 1,
    EDIT = 2,
    ADD_NFTS = 3,
}

export default class CreditCollectionStore {

    creditStep: CreditCollectionDetailsSteps;
    creditMode: CreditCollectionMode;

    accountSessionStore: AccountSessionStore;
    miningFarmRepo: MiningFarmRepo;
    collectionRepo: CollectionRepo;
    nftRepo: NftRepo;

    tempIdGenerator: TempIdGenerator;

    collectionEntity: CollectionEntity;
    nftEntities: NftEntity[];
    selectedNftEntity: NftEntity;

    defaultHashAndPriceValues: number;

    constructor(accountSessionStore: AccountSessionStore, collectionRepo: CollectionRepo, nftRepo: NftRepo, miningFarmRepo: MiningFarmRepo) {
        this.creditStep = CreditCollectionDetailsSteps.COLLECTION_DETAILS;
        this.creditMode = CreditCollectionMode.CREATE;

        this.accountSessionStore = accountSessionStore;
        this.collectionRepo = collectionRepo;
        this.nftRepo = nftRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.collectionEntity = null;
        this.nftEntities = [];
        this.selectedNftEntity = null;
        this.tempIdGenerator = new TempIdGenerator();

        this.defaultHashAndPriceValues = S.INT_FALSE;

        makeAutoObservable(this);
    }

    moveToStepDetails = () => {
        this.creditStep = CreditCollectionDetailsSteps.COLLECTION_DETAILS;
    }

    moveToStepAddNfts = () => {
        this.creditStep = CreditCollectionDetailsSteps.ADD_NFTS;
    }

    moveToStepFinish = () => {
        this.creditStep = CreditCollectionDetailsSteps.FINISH
    }

    isStepDetails(): boolean {
        return this.creditStep === CreditCollectionDetailsSteps.COLLECTION_DETAILS;
    }

    isStepAddNfts(): boolean {
        return this.creditStep === CreditCollectionDetailsSteps.ADD_NFTS;
    }

    isStepFinish(): boolean {
        return this.creditStep === CreditCollectionDetailsSteps.FINISH
    }

    isCreateMode(): boolean {
        return this.creditMode === CreditCollectionMode.CREATE;
    }

    isEditMode(): boolean {
        return this.creditMode === CreditCollectionMode.EDIT;
    }

    isAddNftsMode(): boolean {
        return this.creditMode === CreditCollectionMode.ADD_NFTS;
    }

    async initAsCreate() {
        const farmId = (await this.miningFarmRepo.fetchMiningFarmBySessionAccountId()).id;
        const ownerAddress = (await this.accountSessionStore.adminEntity).cudosWalletAddress;

        runInAction(() => {
            this.creditStep = CreditCollectionDetailsSteps.COLLECTION_DETAILS;
            this.creditMode = CreditCollectionMode.CREATE;
            this.collectionEntity = new CollectionEntity();
            this.collectionEntity.farmId = farmId;
            this.collectionEntity.ownerAddress = ownerAddress;
        });
    }

    async initAsEdit(collectionId: string) {
        await this.fetchCollectionData(collectionId);
        this.creditStep = CreditCollectionDetailsSteps.COLLECTION_DETAILS;
        this.creditMode = CreditCollectionMode.EDIT;
    }

    async initAsAddNfts(collectionId: string) {
        await this.fetchCollectionData(collectionId);
        this.creditStep = CreditCollectionDetailsSteps.ADD_NFTS;
        this.creditMode = CreditCollectionMode.ADD_NFTS;
    }

    async fetchCollectionData(collectionId: string) {
        this.collectionEntity = await this.collectionRepo.fetchCollectionById(collectionId, CollectionStatus.ANY);
        const nftFilter = new NftFilterModel();
        nftFilter.collectionIds = [collectionId];
        nftFilter.count = Number.MAX_SAFE_INTEGER;
        nftFilter.collectionStatus = CollectionStatus.ANY;

        const { nftEntities } = await this.nftRepo.fetchNftsByFilter(nftFilter);
        this.nftEntities = nftEntities;
    }

    initNewNftEntity(): void {
        const nftEntity = new NftEntity();

        if (this.collectionEntity.hasDefaultValuesPerNft() === true) {
            nftEntity.price = this.collectionEntity.defaultPricePerNft;
            nftEntity.hashPowerInEH = this.collectionEntity.defaultHashPowerInEHPerNftInEH;
        }
        nftEntity.farmRoyalties = this.collectionEntity.royalties;
        nftEntity.maintenanceFee = new BigNumber(this.collectionEntity.maintenanceFees);

        this.selectedNftEntity = nftEntity;
    }

    isSelectedNftImageEmpty(): boolean {
        return this.selectedNftEntity === null ? true : this.selectedNftEntity.imageUrl === S.Strings.EMPTY
    }

    isProfilePictureEmpty(): boolean {
        return this.collectionEntity.profileImgUrl === S.Strings.EMPTY
    }

    isCoverPictureEmpty(): boolean {
        return this.collectionEntity.coverImgUrl === S.Strings.EMPTY
    }

    onChangeCollectionName = (name: string) => {
        this.collectionEntity.name = name;
    }

    onChangeCollectionDescription = (description: string) => {
        this.collectionEntity.description = description;
    }

    onChangeCollectionPayoutAddress = (payoutAddress: string) => {
        this.collectionEntity.payoutAddress = payoutAddress;
    }

    onChangeSelectedNftName = (nftName: string) => {
        this.selectedNftEntity.name = nftName;
    }

    onChangeSelectedNftHashPower = (hasHPower: string) => {
        this.selectedNftEntity.hashPowerInEH = Number(hasHPower);
    }

    onChangeSelectedNftPrice = (price: string) => {
        this.selectedNftEntity.price = new BigNumber(price);
    }

    onChangeSelectedNftRoyalties = (royalties: string) => {
        this.selectedNftEntity.farmRoyalties = Number(royalties);
    }

    onChangeSelectedNftMaintenanceFee = (value: string) => {
        this.selectedNftEntity.maintenanceFee = new BigNumber(value);
    }

    onChangeSelectedNftExpirationDate = (expirationDate: number) => {
        this.selectedNftEntity.expiryDate = expirationDate;
    }

    onClickEditNft = (nftEntityId: string) => {
        this.selectedNftEntity = this.nftEntities.find((nftEntity: NftEntity) => nftEntity.id === nftEntityId).cloneDeep();
    }

    onClickSendForApproval = async () => {
        this.collectionEntity.markQueued();
        await this.collectionRepo.creditCollection(this.collectionEntity, this.nftEntities);
    }

    onClickSave = async () => {
        await this.collectionRepo.creditCollection(this.collectionEntity, this.nftEntities);
    }

    onClickDeleteNft = (nftEntityId: string) => {
        this.nftEntities = this.nftEntities.filter((nftEntity: NftEntity) => nftEntity.id !== nftEntityId);
    }

    onClickAddToCollection = () => {
        if (this.selectedNftEntity.isNew() === false) {
            const existingNftEntity = this.nftEntities.find((nftEntity: NftEntity) => nftEntity.id === this.selectedNftEntity.id)
            existingNftEntity.copyDeepFrom(this.selectedNftEntity);
        } else {
            this.selectedNftEntity.id = this.tempIdGenerator.generateNewId();
            this.nftEntities.push(this.selectedNftEntity);
        }

        this.initNewNftEntity();
    }

    getSelectedNftMaintenanceFeeInputValue() {
        if (this.selectedNftEntity === null) {
            return '';
        }

        if (this.selectedNftEntity.maintenanceFee.eq(new BigNumber(S.NOT_EXISTS))) {
            return ''
        }

        return this.selectedNftEntity.maintenanceFee.toString();
    }

    getSelectedNftRoyaltiesInputValue() {
        if (this.selectedNftEntity === null) {
            return '';
        }

        if (this.selectedNftEntity.farmRoyalties === S.NOT_EXISTS) {
            return ''
        }

        return this.selectedNftEntity.farmRoyalties.toString();
    }

    getSelectedNftExpirationDateDisplay(): Date {
        if (this.selectedNftEntity === null) {
            return new Date();
        }

        return this.selectedNftEntity.expiryDate === S.NOT_EXISTS ? new Date() : new Date(this.selectedNftEntity.expiryDate)
    }

}
