import { action, makeAutoObservable, runInAction } from 'mobx';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import MiningFarmRepo from '../repos/MiningFarmRepo';
import MinerEntity from '../../entities/MinerEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import EnergySourceEntity from '../../entities/EnergySourceEntity';
import S from '../../../core/utilities/Main';
import AlertStore from '../../../core/presentation/stores/AlertStore';

export default class CreditMiningFarmDetailsPageStore {

    static STEP_FARM_DETAILS = 1;
    static STEP_REVIEW = 2;
    static STEP_SUCCESS = 3;

    accountSessionStore: AccountSessionStore;
    miningFarmRepo: MiningFarmRepo;
    alertStore: AlertStore

    step: number;
    manufacturerInputValue: string;
    minerInputValue: string;
    energySourceInputValue: string

    manufacturerEntities: ManufacturerEntity[];
    minerEntities: MinerEntity[];
    energySourceEntities: EnergySourceEntity[];
    manufacturerEntitiesMap: Map < string, ManufacturerEntity >;
    minerEntitiesMap: Map < string, MinerEntity >;
    energySourceEntitiesMap: Map < string, EnergySourceEntity >;

    miningFarmEntity: MiningFarmEntity;
    // imageEntities: ImageEntity[];

    constructor(accountSessionStore: AccountSessionStore, miningFarmRepo: MiningFarmRepo, alertStore: AlertStore) {
        this.accountSessionStore = accountSessionStore;
        this.miningFarmRepo = miningFarmRepo;
        this.alertStore = alertStore;

        this.setStepFarmDetails();
        this.manufacturerInputValue = '';
        this.minerInputValue = '';
        this.energySourceInputValue = '';

        this.manufacturerEntities = [];
        this.minerEntities = [];
        this.energySourceEntities = [];
        this.manufacturerEntitiesMap = null;
        this.minerEntitiesMap = null;
        this.energySourceEntitiesMap = null;

        this.miningFarmEntity = null;
        // this.imageEntities = [];

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

        const miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId();

        runInAction(() => {
            this.manufacturerEntities = manufacturerEntities;
            this.minerEntities = minerEntities;
            this.energySourceEntities = energySourceEntities;
            this.manufacturerEntitiesMap = manufacturerEntitiesMap;
            this.minerEntitiesMap = minerEntitiesMap;
            this.energySourceEntitiesMap = energySourceEntitiesMap;
            this.miningFarmEntity = miningFarmEntity ?? MiningFarmEntity.newInstanceWithEmail(this.accountSessionStore.accountEntity.email);
            this.miningFarmEntity.accountId = this.accountSessionStore.accountEntity?.accountId;
        });
    }

    setStepFarmDetails = action(() => {
        this.step = CreditMiningFarmDetailsPageStore.STEP_FARM_DETAILS;
    })

    setStepReview = action(() => {
        this.step = CreditMiningFarmDetailsPageStore.STEP_REVIEW;
    })

    setStepSuccess = action(() => {
        this.step = CreditMiningFarmDetailsPageStore.STEP_SUCCESS;
    })

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
        try {
            await this.miningFarmRepo.creditMiningFarm(this.miningFarmEntity);
            this.setStepSuccess();
        } catch (e) {
            console.log(e);
        }
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

    getSelectedManufacturersNames(): string {
        return this.getSelectedManufacturers().map((manufacturerEntity) => {
            return manufacturerEntity.name;
        }).join(', ');
    }

    getSelectedMinersNames(): string {
        return this.getSelectedMiners().map((minerEntity) => {
            return minerEntity.name
        }).join(', ');
    }

    getSelectedEnergySourcesNames(): string {
        return this.getSelectedEnergySources().map((energySourceEntity) => {
            return energySourceEntity.name
        }).join(', ');
    }

    onClickAddManufacturer = async () => {
        if (this.manufacturerInputValue === '') {
            return;
        }

        const manufacturerEntity = ManufacturerEntity.newInstance(S.Strings.NOT_EXISTS, this.manufacturerInputValue);
        await this.miningFarmRepo.creditManufacturer(manufacturerEntity);

        runInAction(() => {
            this.manufacturerEntitiesMap.set(manufacturerEntity.manufacturerId, manufacturerEntity);
            this.manufacturerEntities.push(manufacturerEntity);
            this.miningFarmEntity.manufacturerIds.push(manufacturerEntity.manufacturerId);
            this.manufacturerInputValue = '';
        });
    }

    onClickAddMiner = async () => {
        if (this.minerInputValue === '') {
            return;
        }

        const minerEntity = MinerEntity.newInstance(S.Strings.NOT_EXISTS, this.minerInputValue)
        await this.miningFarmRepo.creditMiner(minerEntity);

        runInAction(() => {
            this.minerEntitiesMap.set(minerEntity.minerId, minerEntity);
            this.minerEntities.push(minerEntity);
            this.miningFarmEntity.minerIds.push(minerEntity.minerId);
            this.minerInputValue = '';
        });
    }

    onClickAddEnergySource = async () => {
        if (this.energySourceInputValue === '') {
            return;
        }

        const energySourceEntity = EnergySourceEntity.newInstance(S.Strings.NOT_EXISTS, this.energySourceInputValue);
        await this.miningFarmRepo.creditEnergySource(energySourceEntity);

        runInAction(() => {
            this.energySourceEntitiesMap.set(energySourceEntity.energySourceId, energySourceEntity);
            this.energySourceEntities.push(energySourceEntity);
            this.miningFarmEntity.energySourceIds.push(energySourceEntity.energySourceId);
            this.energySourceInputValue = '';
        });
    }
}
