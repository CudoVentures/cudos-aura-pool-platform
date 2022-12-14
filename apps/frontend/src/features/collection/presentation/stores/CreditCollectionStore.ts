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
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import MiningFarmDetailsEntity from '../../../mining-farm/entities/MiningFarmDetailsEntity';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import { MiningFarmStatus } from '../../../mining-farm/entities/MiningFarmEntity';

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
    miningFarmDetailsEntity: MiningFarmDetailsEntity;
    collectionDetailsEntity: CollectionDetailsEntity;

    defaultHashAndPriceValues: number;
    miningFarmRemainingHashPower: number;
    selectedNftHashingPowerInThInputValue: string;
    selectedNftPriceInCudosInputValue: string;
    // selectedNftMaintenanceFeeInBtcInputValue: string;

    constructor(accountSessionStore: AccountSessionStore, collectionRepo: CollectionRepo, nftRepo: NftRepo, miningFarmRepo: MiningFarmRepo) {
        this.creditStep = CreditCollectionDetailsSteps.COLLECTION_DETAILS;
        this.creditMode = CreditCollectionMode.CREATE;

        this.accountSessionStore = accountSessionStore;
        this.collectionRepo = collectionRepo;
        this.nftRepo = nftRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.tempIdGenerator = new TempIdGenerator();

        this.collectionEntity = null;
        this.nftEntities = [];
        this.selectedNftEntity = null;
        this.miningFarmDetailsEntity = null;
        this.collectionDetailsEntity = null;

        this.defaultHashAndPriceValues = S.INT_FALSE;
        this.miningFarmRemainingHashPower = 0;
        this.selectedNftHashingPowerInThInputValue = '';
        this.selectedNftPriceInCudosInputValue = '';
        // this.selectedNftMaintenanceFeeInBtcInputValue = '';

        makeAutoObservable(this);
    }

    async initAsCreate() {
        const farmId = (await this.miningFarmRepo.fetchMiningFarmBySessionAccountId(MiningFarmStatus.APPROVED)).id;

        runInAction(() => {
            this.creditStep = CreditCollectionDetailsSteps.COLLECTION_DETAILS;
            this.creditMode = CreditCollectionMode.CREATE;
            this.collectionEntity = new CollectionEntity();
            this.collectionEntity.farmId = farmId;

            this.fetchMiningFarmDetails();
        });
    }

    async initAsEdit(collectionId: string) {
        await this.fetchCollectionData(collectionId);
        await this.fetchMiningFarmDetails();

        runInAction(() => {
            this.creditStep = CreditCollectionDetailsSteps.COLLECTION_DETAILS;
            this.creditMode = CreditCollectionMode.EDIT;
        });
    }

    async initAsAddNfts(collectionId: string) {
        await this.fetchCollectionData(collectionId);
        await this.fetchMiningFarmDetails();
        if (this.nftEntities.length === 0) {
            this.initNewNftEntity();
        }

        runInAction(() => {
            this.creditStep = CreditCollectionDetailsSteps.ADD_NFTS;
            this.creditMode = CreditCollectionMode.ADD_NFTS;
        });
    }

    async fetchCollectionData(collectionId: string) {
        this.collectionEntity = await this.collectionRepo.fetchCollectionById(collectionId, CollectionStatus.ANY);
        const nftFilter = new NftFilterModel();
        nftFilter.collectionIds = [collectionId];
        nftFilter.count = Number.MAX_SAFE_INTEGER;

        const { nftEntities } = await this.nftRepo.fetchNftsByFilter(nftFilter);
        this.nftEntities = nftEntities;
    }

    async fetchMiningFarmDetails() {
        try {
            this.miningFarmDetailsEntity = await this.miningFarmRepo.fetchMiningFarmDetailsById(this.collectionEntity.farmId);
            this.miningFarmRemainingHashPower = this.miningFarmDetailsEntity.remainingHashPowerInTH;
            if (this.collectionEntity.isNew() === false) {
                this.miningFarmRemainingHashPower += this.collectionEntity.hashPowerInTh;
            }
        } catch (e) {
            console.log(e);
        }
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

    initNewNftEntity(): void {
        const nftEntity = new NftEntity();

        if (this.collectionEntity.hasDefaultValuesPerNft() === true) {
            nftEntity.priceInAcudos = this.collectionEntity.getDefaultPricePerNftInAcudos();
            nftEntity.hashPowerInTh = this.collectionEntity.defaultHashPowerPerNftInTh;
        }
        // nftEntity.farmRoyalties = this.collectionEntity.royalties;
        // nftEntity.maintenanceFeeInBtc = new BigNumber(this.collectionEntity.maintenanceFeeInBtc);

        this.onClickEditNft(nftEntity);
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

    getCollectionRemainingHashPowerForSelectedNft(): number {
        if (this.selectedNftEntity === null || this.collectionEntity.hasHashPowerInTh() === false) {
            return 0;
        }

        return this.nftEntities.reduce((accu, nftEntity) => {
            return accu - (nftEntity.id === this.selectedNftEntity.id ? 0 : nftEntity.hashPowerInTh);
        }, this.collectionEntity.hashPowerInTh);
    }

    formatMiningFarmRemainingHashPower(): string {
        return this.miningFarmRemainingHashPower.toFixed(5);
    }

    formatCollectionRemainingHashPowerForSelectedNft(): string {
        return this.getCollectionRemainingHashPowerForSelectedNft().toFixed(5);
    }

    // on change collection
    onChangeCollectionName = (inputValue: string) => {
        this.collectionEntity.name = inputValue;
    }

    onChangeCollectionDescription = (inputValue: string) => {
        this.collectionEntity.description = inputValue;
    }

    // onChangeCollectionPayoutAddress = (inputValue: string) => {
    //     this.collectionEntity.payoutAddress = inputValue;
    // }

    // on change nft
    onChangeSelectedNftName = (nftName: string) => {
        this.selectedNftEntity.name = nftName;
    }

    onChangeSelectedNftHashPowerInTh = (inputValue: string) => {
        this.selectedNftHashingPowerInThInputValue = inputValue;
        this.selectedNftEntity.hashPowerInTh = inputValue !== '' ? parseFloat(inputValue) : S.NOT_EXISTS;
    }

    onChangeSelectedNftPriceInCudos = (inputValue: string) => {
        this.selectedNftPriceInCudosInputValue = inputValue;
        this.selectedNftEntity.priceInAcudos = inputValue !== '' ? ProjectUtils.CUDOS_CURRENCY_DIVIDER.multipliedBy(new BigNumber(inputValue)) : null;
    }

    // onChangeSelectedNftRoyalties = (inputValue: string) => {
    //     this.selectedNftEntity.farmRoyalties = inputValue !== '' ? parseInt(inputValue) : S.NOT_EXISTS;
    // }

    // onChangeSelectedNftMaintenanceFeeInBtc = (inputValue: string) => {
    //     this.selectedNftMaintenanceFeeInBtcInputValue = inputValue;
    //     this.selectedNftEntity.maintenanceFeeInBtc = inputValue !== '' ? new BigNumber(inputValue) : null;
    // }

    onChangeSelectedNftExpirationDate = (expirationDate: Date) => {
        this.selectedNftEntity.expiryDate = expirationDate !== null ? expirationDate.getTime() : S.NOT_EXISTS;
    }

    // nft get input value
    getSelectedNftName() {
        return this.selectedNftEntity?.name ?? '';
    }

    // getSelectedNftRoyaltiesInputValue() {
    //     if (this.selectedNftEntity === null || this.selectedNftEntity.farmRoyalties === S.NOT_EXISTS) {
    //         return '';
    //     }

    //     return this.selectedNftEntity.farmRoyalties.toString();
    // }

    getSelectedNftExpirationDateInputValue(): Date {
        if (this.selectedNftEntity === null || this.selectedNftEntity.expiryDate === S.NOT_EXISTS) {
            return new Date();
        }

        return new Date(this.selectedNftEntity.expiryDate)
    }

    // nft controls
    onClickEditNft(nftEntity: NftEntity) {
        this.selectedNftEntity = nftEntity.cloneDeep();

        this.selectedNftHashingPowerInThInputValue = nftEntity.hashPowerInTh !== S.NOT_EXISTS ? nftEntity.hashPowerInTh.toString() : '';
        this.selectedNftPriceInCudosInputValue = nftEntity.priceInAcudos !== null ? nftEntity.priceInAcudos.dividedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER).toString() : ''
        // this.selectedNftMaintenanceFeeInBtcInputValue = nftEntity.maintenanceFeeInBtc !== null ? nftEntity.maintenanceFeeInBtc.toString() : '';
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
        this.addedOrEdittedNftEntities = this.addedOrEdittedNftEntities.filter((nftEntity: NftEntity) => nftEntity.id !== nftEntityId);
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

}
