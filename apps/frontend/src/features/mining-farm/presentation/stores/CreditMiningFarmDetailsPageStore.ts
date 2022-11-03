import { makeAutoObservable, runInAction } from 'mobx';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import ImageEntity from '../../../upload-file/entities/ImageEntity';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import MiningFarmRepo from '../repos/MiningFarmRepo';

export default class CreditMiningFarmDetailsPageStore {

    static STEP_FARM_DETAILS = 1;
    static STEP_REVIEW = 2;
    static STEP_SUCCESS = 3;

    accountSessionStore: AccountSessionStore;
    miningFarmRepo: MiningFarmRepo;

    step: number;
    miningFarmEntity: MiningFarmEntity;
    imageEntities: ImageEntity[];

    constructor(accountSessionStore: AccountSessionStore, miningFarmRepo: MiningFarmRepo) {
        this.accountSessionStore = accountSessionStore;
        this.miningFarmRepo = miningFarmRepo;

        this.setStepFarmDetails();
        this.miningFarmEntity = null;
        this.imageEntities = [];

        makeAutoObservable(this);
    }

    async init() {
        this.setStepFarmDetails();
        this.miningFarmEntity = null;
        this.imageEntities = [];

        await this.fetch();
    }

    async fetch() {
        let miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId(MiningFarmStatus.ANY);

        runInAction(() => {
            if (miningFarmEntity === null) {
                miningFarmEntity = new MiningFarmEntity();
            }

            this.miningFarmEntity = miningFarmEntity;
        });
    }

    setStepFarmDetails = () => {
        this.step = CreditMiningFarmDetailsPageStore.STEP_FARM_DETAILS;
    }

    setStepReview = () => {
        this.step = CreditMiningFarmDetailsPageStore.STEP_REVIEW;
    }

    setStepSuccess = () => {
        this.step = CreditMiningFarmDetailsPageStore.STEP_SUCCESS;
    }

    isStepFarmDetails(): boolean {
        return this.step === CreditMiningFarmDetailsPageStore.STEP_FARM_DETAILS;
    }

    isStepReview(): boolean {
        return this.step === CreditMiningFarmDetailsPageStore.STEP_REVIEW;
    }

    isStepSuccess(): boolean {
        return this.step === CreditMiningFarmDetailsPageStore.STEP_SUCCESS;
    }

    finishCreation = async () => {
        // this.miningFarmEntity.accountId = this.accountSessionStore.accountEntity.accountId;
        await this.miningFarmRepo.creditMiningFarm(this.miningFarmEntity);

        runInAction(() => {
            this.setStepSuccess();
        });
    }
}
