import { makeAutoObservable, runInAction } from 'mobx';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import ImageEntity from '../../../upload-file/entities/ImageEntity';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import MiningFarmRepo from '../repos/MiningFarmRepo';
import MinerEntity from '../../entities/MinerEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import EnergySourceEntity from '../../entities/EnergySourceEntity';

export default class CreditMiningFarmDetailsPageStore {

    static STEP_FARM_DETAILS = 1;
    static STEP_REVIEW = 2;
    static STEP_SUCCESS = 3;

    accountSessionStore: AccountSessionStore;
    miningFarmRepo: MiningFarmRepo;

    step: number;
    manufacturerEntities: ManufacturerEntity[];
    minerEntities: MinerEntity[];
    energySourceEntities: EnergySourceEntity[];
    manufacturerEntitiesMap: Map < string, ManufacturerEntity >;
    minerEntitiesMap: Map < string, MinerEntity >;
    energySourceEntitiesMap: Map < string, EnergySourceEntity >;

    miningFarmEntity: MiningFarmEntity;
    imageEntities: ImageEntity[];

    constructor(accountSessionStore: AccountSessionStore, miningFarmRepo: MiningFarmRepo) {
        this.accountSessionStore = accountSessionStore;
        this.miningFarmRepo = miningFarmRepo;

        this.setStepFarmDetails();
        this.manufacturerEntities = [];
        this.minerEntities = [];
        this.energySourceEntities = [];

        this.miningFarmEntity = null;
        this.imageEntities = [];

        makeAutoObservable(this);
    }

    async init() {
        this.setStepFarmDetails();

        const manufacturerEntities = await this.miningFarmRepo.fetchManufacturers();
        const manufacturerEntitiesMap = new Map();
        manufacturerEntities.forEach((manufacturerEntity) => {
            manufacturerEntitiesMap.set(manufacturerEntity.manufacturerId, manufacturerEntity);
        });

        const minerEntities = await this.miningFarmRepo.fetchMiners();
        const minerEntitiesMap = new Map();
        minerEntities.forEach((minerEntity) => {
            minerEntitiesMap.set(minerEntity.minerId, minerEntity);
        });

        const energySourceEntities = await this.miningFarmRepo.fetchEnergySources();
        const energySourceEntitiesMap = new Map();
        energySourceEntities.forEach((energySourceEntity) => {
            energySourceEntitiesMap.set(energySourceEntity.energySourceId, energySourceEntity);
        });

        const miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId(MiningFarmStatus.ANY);

        runInAction(() => {
            this.manufacturerEntities = manufacturerEntities;
            this.minerEntities = minerEntities;
            this.energySourceEntities = energySourceEntities;
            this.manufacturerEntitiesMap = manufacturerEntitiesMap;
            this.minerEntitiesMap = minerEntitiesMap;
            this.energySourceEntitiesMap = energySourceEntitiesMap;
            this.miningFarmEntity = miningFarmEntity ?? new MiningFarmEntity();
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
        this.miningFarmEntity.accountId = this.accountSessionStore.accountEntity.accountId;
        await this.miningFarmRepo.creditMiningFarm(this.miningFarmEntity);

        runInAction(() => {
            this.setStepSuccess();
        });
    }

    getSelectedManufacturers(): ManufacturerEntity[] {
        return this.miningFarmEntity.manufacturerIds.map((manufacturerId) => {
            return this.manufacturerEntitiesMap.get(manufacturerId);
        });
    }

    getSelectedMiners(): MinerEntity[] {
        return this.miningFarmEntity.minerIds.map((minerId) => {
            return this.minerEntitiesMap.get(minerId);
        });
    }

    getSelectedEnergySources(): EnergySourceEntity[] {
        return this.miningFarmEntity.energySourceIds.map((energySourceId) => {
            return this.energySourceEntitiesMap.get(energySourceId);
        });
    }
}
