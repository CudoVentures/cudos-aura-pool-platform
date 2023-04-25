import { makeAutoObservable } from 'mobx';
import TableState from '../../../core/presentation/stores/TableState';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import GeneralStore from '../../../general/presentation/stores/GeneralStore';
import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';
import MiningFarmRepo from '../repos/MiningFarmRepo';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';

export default class QueuedMiningFarmsStore {

    miningFarmRepo: MiningFarmRepo;
    accountSessionStore: AccountSessionStore;
    generalStore: GeneralStore;

    miningFarmsTableState: TableState;

    miningFarmEntities: MiningFarmEntity[];
    manufacturerEntitiesMap: Map < string, ManufacturerEntity >;
    minerEntitiesMap: Map < string, MinerEntity >;
    energySourceEntitiesMap: Map < string, EnergySourceEntity >;

    constructor(miningFarmRepo: MiningFarmRepo, accountSessionStore: AccountSessionStore, generalStore: GeneralStore) {
        this.miningFarmRepo = miningFarmRepo;
        this.accountSessionStore = accountSessionStore;
        this.generalStore = generalStore;

        this.miningFarmsTableState = new TableState(0, [], this.fetchMiningFarms, 8);
        this.miningFarmEntities = null;
        this.manufacturerEntitiesMap = null;
        this.minerEntitiesMap = null;
        this.energySourceEntitiesMap = null;

        makeAutoObservable(this);
    }

    async init(itemsPerPage: number): Promise < void > {
        this.miningFarmsTableState.tableFilterState.from = 0;
        this.miningFarmsTableState.tableFilterState.itemsPerPage = itemsPerPage;

        await Promise.all([
            this.fetchManufacturers(),
            this.fetchMiners(),
            this.fetchEnergySources(),
            this.generalStore.init(),
            this.fetchMiningFarms(),
        ]);
    }

    fetchMiningFarms = async () => {
        const miningFarmFilter = new MiningFarmFilterModel();
        miningFarmFilter.markQueuedMiningFarms();
        miningFarmFilter.from = this.miningFarmsTableState.tableFilterState.from;
        miningFarmFilter.count = this.miningFarmsTableState.tableFilterState.itemsPerPage;

        const { miningFarmEntities, total } = await this.miningFarmRepo.fetchMiningFarmsByFilter(miningFarmFilter);

        await runInActionAsync(() => {
            this.miningFarmEntities = miningFarmEntities;
            this.miningFarmsTableState.tableFilterState.total = total;
        });
    }

    async fetchManufacturers() {
        if (this.manufacturerEntitiesMap !== null) {
            return;
        }

        const manufacturerEntities = await this.miningFarmRepo.fetchManufacturers();
        const manufacturerEntitiesMap = new Map();

        manufacturerEntities.forEach((manufacturerEntity) => {
            manufacturerEntitiesMap.set(manufacturerEntity.manufacturerId, manufacturerEntity);
        });

        await runInActionAsync(() => {
            this.manufacturerEntitiesMap = manufacturerEntitiesMap;
        })
    }

    async fetchMiners() {
        if (this.minerEntitiesMap !== null) {
            return;
        }

        const minerEntities = await this.miningFarmRepo.fetchMiners();
        const minerEntitiesMap = new Map();
        minerEntities.forEach((minerEntity) => {
            minerEntitiesMap.set(minerEntity.minerId, minerEntity);
        });

        await runInActionAsync(() => {
            this.minerEntitiesMap = minerEntitiesMap;
        });
    }

    async fetchEnergySources() {
        if (this.energySourceEntitiesMap !== null) {
            return;
        }

        const energySourceEntities = await this.miningFarmRepo.fetchEnergySources();
        const energySourceEntitiesMap = new Map();
        energySourceEntities.forEach((energySourceEntity) => {
            energySourceEntitiesMap.set(energySourceEntity.energySourceId, energySourceEntity);
        });

        await runInActionAsync(() => {
            this.energySourceEntitiesMap = energySourceEntitiesMap;
        });
    }

    getManufacturersNames(miningFarmEntity: MiningFarmEntity): string {
        if (this.manufacturerEntitiesMap === null) {
            return '';
        }

        return miningFarmEntity.manufacturerIds.map((manufacturerId) => {
            return this.manufacturerEntitiesMap.get(manufacturerId).name;
        }).join(', ');
    }

    getMinersNames(miningFarmEntity: MiningFarmEntity): string {
        if (this.minerEntitiesMap === null) {
            return '';
        }

        return miningFarmEntity.minerIds.map((minerId) => {
            return this.minerEntitiesMap.get(minerId).name;
        }).join(', ');
    }

    getEnergySourcesNames(miningFarmEntity: MiningFarmEntity): string {
        if (this.energySourceEntitiesMap === null) {
            return '';
        }

        return miningFarmEntity.energySourceIds.map((energySourceId) => {
            return this.energySourceEntitiesMap.get(energySourceId).name;
        }).join(', ');
    }

    // async approveMiningFarm(miningFarmEntity: MiningFarmEntity) {
    //     const clonedMiningFarm = miningFarmEntity.clone();
    //     clonedMiningFarm.markApproved();

    //     // if royalties not custom set for this farm, set the super admin standard onss
    //     if (clonedMiningFarm.isCudosMintNftRoyaltiesPercentSet() === false) {
    //         clonedMiningFarm.cudosMintNftRoyaltiesPercent = this.generalStore.settingsEntity.firstSaleCudosRoyaltiesPercent;
    //     }

    //     if (clonedMiningFarm.isCudosResaleNftRoyaltiesPercentSet() === false) {
    //         clonedMiningFarm.cudosResaleNftRoyaltiesPercent = this.generalStore.settingsEntity.resaleCudosRoyaltiesPercent;
    //     }

    //     await this.miningFarmRepo.creditMiningFarm(clonedMiningFarm);

    //     this.fetchMiningFarms();
    // }

    async rejectMiningfarm(miningFarmEntity: MiningFarmEntity) {
        const clonedMiningFarm = miningFarmEntity.clone();

        clonedMiningFarm.markRejected();
        await this.miningFarmRepo.creditMiningFarm(clonedMiningFarm);

        this.fetchMiningFarms();
    }

}
