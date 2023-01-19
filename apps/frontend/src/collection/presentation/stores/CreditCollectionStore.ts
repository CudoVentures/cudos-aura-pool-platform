import S from '../../../core/utilities/Main';
import { action, makeAutoObservable, runInAction } from 'mobx';
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
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import MiningFarmEntity, { MiningFarmStatus } from '../../../mining-farm/entities/MiningFarmEntity';
import { CURRENCY_DECIMALS } from 'cudosjs';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';

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

        runInAction(() => {
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

        runInAction(() => {
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

        runInAction(() => {
            this.initNewNftEntity();
            this.creditStep = CreditCollectionDetailsSteps.ADD_NFTS;
            this.creditMode = CreditCollectionMode.ADD_NFTS;
        });
    }

    fetchCollectionData(collectionId: string) {
        return new Promise < void >((resolve, reject) => {
            const run = async () => {
                const collectionEntity = await this.collectionRepo.fetchCollectionById(collectionId);

                const nftFilter = new NftFilterModel();
                nftFilter.collectionIds = [collectionId];
                nftFilter.count = Number.MAX_SAFE_INTEGER;
                const { nftEntities } = await this.nftRepo.fetchNftsByFilter(nftFilter);

                runInAction(() => {
                    this.nftEntities = nftEntities;
                    this.collectionEntity = collectionEntity;
                    resolve();
                })
            }

            run();
        });
    }

    fetchMiningFarm() {
        return new Promise < void >((resolve, reject) => {
            const run = async () => {
                const miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId(MiningFarmStatus.APPROVED);

                runInAction(() => {
                    this.miningFarmEntity = miningFarmEntity;
                    resolve();
                });
            }

            run();
        });

    }

    async fetchMiningFarmDetails() {
        return new Promise < void >((resolve, reject) => {
            const run = async () => {
                try {
                    const miningFarmDetailsEntity = await this.miningFarmRepo.fetchMiningFarmDetailsById(this.miningFarmEntity.id);

                    runInAction(() => {
                        this.miningFarmDetailsEntity = miningFarmDetailsEntity;
                        this.miningFarmRemainingHashPower = miningFarmDetailsEntity.remainingHashPowerInTH;
                        if (this.collectionEntity?.isNew() === false) {
                            this.miningFarmRemainingHashPower += this.collectionEntity.hashPowerInTh;
                        }
                        resolve();
                    })
                } catch (e) {
                    console.log(e);
                    resolve();
                }
            }

            run();
        });

    }

    moveToStepDetails = action(() => {
        this.creditStep = CreditCollectionDetailsSteps.COLLECTION_DETAILS;
    })

    moveToStepAddNfts = action(() => {
        this.initNewNftEntity();
        this.creditStep = CreditCollectionDetailsSteps.ADD_NFTS;
    })

    moveToStepFinish = action(() => {
        this.creditStep = CreditCollectionDetailsSteps.FINISH
    })

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
    onChangeCollectionName = action((inputValue: string) => {
        this.collectionEntity.name = inputValue;
    })

    onChangeCollectionDescription = action((inputValue: string) => {
        this.collectionEntity.description = inputValue;
    })

    // onChangeCollectionPayoutAddress = (inputValue: string) => {
    //     this.collectionEntity.payoutAddress = inputValue;
    // }

    // on change nft
    onChangeSelectedNftName = action((nftName: string) => {
        this.selectedNftEntity.name = nftName;
    })

    onChangeSelectedNftHashPowerInTh = action((inputValue: string) => {
        this.selectedNftHashingPowerInThInputValue = inputValue;
        this.selectedNftEntity.hashPowerInTh = inputValue !== '' ? parseFloat(inputValue) : S.NOT_EXISTS;
    })

    onChangeSelectedNftPriceInDollars = action((inputValue: string) => {
        this.selectedNftPriceInDollarsInputValue = inputValue;
        this.selectedNftEntity.priceInAcudos = inputValue !== ''
            ? this.cudosStore.convertUsdInAcudos(Number(inputValue))
            : null;
    })

    // onChangeSelectedNftRoyalties = (inputValue: string) => {
    //     this.selectedNftEntity.farmRoyalties = inputValue !== '' ? parseInt(inputValue) : S.NOT_EXISTS;
    // }

    // onChangeSelectedNftMaintenanceFeeInBtc = (inputValue: string) => {
    //     this.selectedNftMaintenanceFeeInBtcInputValue = inputValue;
    //     this.selectedNftEntity.maintenanceFeeInBtc = inputValue !== '' ? new BigNumber(inputValue) : null;
    // }

    onChangeSelectedNftExpirationDate = action((expirationDateTimestamp: Date) => {
        this.selectedNftEntity.expirationDateTimestamp = expirationDateTimestamp !== null ? expirationDateTimestamp.getTime() : S.NOT_EXISTS;
    })

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

    getSelectedNftPriceDisplayInCudos(): string {
        return this.selectedNftEntity?.priceInAcudos?.shiftedBy(-CURRENCY_DECIMALS).toFixed(2) ?? '0';
    }

    getCurrentNftIncomeForFarmFormatted(): string {
        const nftPriceInCudos = this.selectedNftEntity?.priceInAcudos?.shiftedBy(-CURRENCY_DECIMALS) ?? new BigNumber(0);
        const cudosMintNftRoyaltiesPercent = this.miningFarmEntity?.cudosMintNftRoyaltiesPercent ?? 100;
        return nftPriceInCudos.multipliedBy(1 - (cudosMintNftRoyaltiesPercent / 100)).toFormat(2);
    }

    getSelectedNftExpirationDateInputValue(): Date {
        if (this.selectedNftEntity === null || this.selectedNftEntity.expirationDateTimestamp === S.NOT_EXISTS) {
            return new Date();
        }

        return new Date(this.selectedNftEntity.expirationDateTimestamp)
    }

    // nft controls
    @action
    onClickEditNft(nftEntity: NftEntity) {
        this.selectedNftEntity = nftEntity.cloneDeep();

        this.selectedNftHashingPowerInThInputValue = nftEntity.hashPowerInTh !== S.NOT_EXISTS ? nftEntity.hashPowerInTh.toString() : '';
        this.selectedNftPriceInDollarsInputValue = nftEntity.priceInAcudos !== null
            ? this.cudosStore.convertAcudosInUsd(nftEntity.priceInAcudos).toFixed(2)
            : ''
    }

    onClickSendForApproval = async () => {
        await this.collectionRepo.creditCollection(this.collectionEntity, this.nftEntities);

        runInAction(() => {
            this.collectionEntity.markQueued();
        })
    }

    onClickSave = async () => {
        await this.collectionRepo.creditCollection(this.collectionEntity, this.nftEntities);
    }

    onClickDeleteNft = action((nftEntityId: string) => {
        this.nftEntities = this.nftEntities.filter((nftEntity: NftEntity) => nftEntity.id !== nftEntityId);
    })

    onClickAddToCollection = action(() => {
        if (this.selectedNftEntity.isNew() === false) {
            const existingNftEntity = this.nftEntities.find((nftEntity: NftEntity) => nftEntity.id === this.selectedNftEntity.id)
            existingNftEntity.copyDeepFrom(this.selectedNftEntity);
        } else {
            this.selectedNftEntity.id = this.tempIdGenerator.generateNewId();
            this.nftEntities.push(this.selectedNftEntity);
        }

        this.initNewNftEntity();
    })

}
