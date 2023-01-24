import S from '../../../core/utilities/Main';
import { makeAutoObservable, runInAction } from 'mobx';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import CollectionEntity from '../../entities/CollectionEntity';
import CollectionRepo from '../repos/CollectionRepo';
import BigNumber from 'bignumber.js';
import NftEntity from '../../../nft/entities/NftEntity';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import TempIdGenerator from '../../../core/utilities/TempIdGenerator';
import MiningFarmDetailsEntity from '../../../mining-farm/entities/MiningFarmDetailsEntity';
import MiningFarmEntity, { MiningFarmStatus } from '../../../mining-farm/entities/MiningFarmEntity';
import { CURRENCY_DECIMALS } from 'cudosjs';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';

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
    cudosStore: CudosStore;

    accountSessionStore: AccountSessionStore;
    miningFarmRepo: MiningFarmRepo;
    collectionRepo: CollectionRepo;
    nftRepo: NftRepo;

    tempIdGenerator: TempIdGenerator;

    collectionEntity: CollectionEntity;
    nftEntities: NftEntity[];
    selectedNftEntity: NftEntity;
    miningFarmEntity: MiningFarmEntity;
    miningFarmDetailsEntity: MiningFarmDetailsEntity;

    defaultHashAndPriceValues: number;
    miningFarmRemainingHashPower: number;
    selectedNftHashingPowerInThInputValue: string;
    selectedNftPriceInDollarsInputValue: string;

    constructor(cudosStore: CudosStore, accountSessionStore: AccountSessionStore, collectionRepo: CollectionRepo, nftRepo: NftRepo, miningFarmRepo: MiningFarmRepo) {
        this.creditStep = CreditCollectionDetailsSteps.COLLECTION_DETAILS;
        this.creditMode = CreditCollectionMode.CREATE;

        this.cudosStore = cudosStore;
        this.accountSessionStore = accountSessionStore;
        this.collectionRepo = collectionRepo;
        this.nftRepo = nftRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.tempIdGenerator = new TempIdGenerator();

        this.initCreditValues();

        makeAutoObservable(this);
    }

    initCreditValues() {
        this.miningFarmEntity = null;
        this.miningFarmDetailsEntity = null;
        this.collectionEntity = null;
        this.nftEntities = [];
        this.selectedNftEntity = null;

        this.defaultHashAndPriceValues = S.INT_FALSE;
        this.miningFarmRemainingHashPower = 0;
        this.selectedNftHashingPowerInThInputValue = '';
        this.selectedNftPriceInDollarsInputValue = '';
    }

    async initAsCreate() {
        this.initCreditValues();

        await this.fetchMiningFarm();
        await this.fetchMiningFarmDetails();

        await runInActionAsync(() => {
            this.creditStep = CreditCollectionDetailsSteps.COLLECTION_DETAILS;
            this.creditMode = CreditCollectionMode.CREATE;
            this.collectionEntity = new CollectionEntity();
            this.collectionEntity.farmId = this.miningFarmEntity.id;
        });
    }

    async initAsEdit(collectionId: string) {
        this.initCreditValues();

        await this.fetchCollectionData(collectionId);
        await this.fetchMiningFarm();
        await this.fetchMiningFarmDetails();

        await runInActionAsync(() => {
            this.creditStep = CreditCollectionDetailsSteps.COLLECTION_DETAILS;
            this.creditMode = CreditCollectionMode.EDIT;
        });
    }

    async initAsAddNfts(collectionId: string) {
        this.initCreditValues();

        await this.cudosStore.init();
        await this.fetchCollectionData(collectionId);
        await this.fetchMiningFarm();
        await this.fetchMiningFarmDetails();

        await runInActionAsync(() => {
            this.initNewNftEntity();
            this.creditStep = CreditCollectionDetailsSteps.ADD_NFTS;
            this.creditMode = CreditCollectionMode.ADD_NFTS;
        });
    }

    async fetchCollectionData(collectionId: string) {
        const collectionEntity = await this.collectionRepo.fetchCollectionById(collectionId);

        const nftFilter = new NftFilterModel();
        nftFilter.collectionIds = [collectionId];
        nftFilter.count = Number.MAX_SAFE_INTEGER;
        const { nftEntities } = await this.nftRepo.fetchNftsByFilter(nftFilter);

        await runInActionAsync(() => {
            this.nftEntities = nftEntities;
            this.collectionEntity = collectionEntity;
        });
    }

    async fetchMiningFarm() {
        const miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId(MiningFarmStatus.APPROVED);

        await runInActionAsync(() => {
            this.miningFarmEntity = miningFarmEntity;
        });
    }

    async fetchMiningFarmDetails() {
        try {
            const miningFarmDetailsEntity = await this.miningFarmRepo.fetchMiningFarmDetailsById(this.miningFarmEntity.id);

            await runInActionAsync(() => {
                this.miningFarmDetailsEntity = miningFarmDetailsEntity;
                this.miningFarmRemainingHashPower = miningFarmDetailsEntity.remainingHashPowerInTH;
                if (this.collectionEntity?.isNew() === false) {
                    this.miningFarmRemainingHashPower += this.collectionEntity.hashPowerInTh;
                }
            })
        } catch (e) {
            console.log(e);
        }
    }

    moveToStepDetails = () => {
        this.creditStep = CreditCollectionDetailsSteps.COLLECTION_DETAILS;
    }

    moveToStepAddNfts = () => {
        this.initNewNftEntity();
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
        nftEntity.markAsExpiringToday();
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

    // on change nft
    onChangeSelectedNftName = (nftName: string) => {
        this.selectedNftEntity.name = nftName;
    }

    onChangeSelectedNftHashPowerInTh = (inputValue: string) => {
        this.selectedNftHashingPowerInThInputValue = inputValue;
        this.selectedNftEntity.hashPowerInTh = inputValue !== '' ? parseFloat(inputValue) : S.NOT_EXISTS;
    }

    onChangeSelectedNftPriceInDollars = (inputValue: string) => {
        this.selectedNftPriceInDollarsInputValue = inputValue;
        this.selectedNftEntity.priceUsd = inputValue !== '' ? Number(inputValue) : S.NOT_EXISTS;
    }

    onChangeSelectedNftExpirationDate = (expirationDateTimestamp: Date) => {
        if (expirationDateTimestamp !== null) {
            this.selectedNftEntity.expirationDateTimestamp = expirationDateTimestamp.getTime();
        } else {
            this.selectedNftEntity.markAsExpiringToday();
        }
    }

    // nft get input value
    getSelectedNftName() {
        return this.selectedNftEntity?.name ?? '';
    }

    getSelectedNftPriceDisplayInCudos(): string {
        const cudosPrice = this.cudosStore.convertUsdInAcudos(this.selectedNftEntity?.priceUsd);
        return this.selectedNftPriceInDollarsInputValue !== '' ? cudosPrice.shiftedBy(-CURRENCY_DECIMALS).toFixed(2) : '0';
    }

    getCurrentNftIncomeForFarmFormatted(): string {
        const nftPriceInCudos = this.selectedNftEntity?.priceInAcudos?.shiftedBy(-CURRENCY_DECIMALS) ?? new BigNumber(0);
        const cudosMintNftRoyaltiesPercent = this.miningFarmEntity?.cudosMintNftRoyaltiesPercent ?? 100;
        return nftPriceInCudos.multipliedBy(1 - (cudosMintNftRoyaltiesPercent / 100)).toFormat(2);
    }

    getSelectedNftExpirationDateInputValue(): Date {
        if (this.selectedNftEntity === null) {
            return new Date();
        }

        return new Date(this.selectedNftEntity.expirationDateTimestamp)
    }

    // nft controls
    onClickEditNft(nftEntity: NftEntity) {
        this.selectedNftEntity = nftEntity.cloneDeep();

        this.selectedNftHashingPowerInThInputValue = nftEntity.hashPowerInTh !== S.NOT_EXISTS ? nftEntity.hashPowerInTh.toString() : '';
        this.selectedNftPriceInDollarsInputValue = nftEntity.priceInAcudos !== null ? this.cudosStore.convertAcudosInUsd(nftEntity.priceInAcudos).toFixed(2) : '';
    }

    onClickSendForApproval = async () => {
        await this.collectionRepo.creditCollection(this.collectionEntity, this.nftEntities);

        await runInActionAsync(() => {
            this.collectionEntity.markQueued();
        })
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

}
