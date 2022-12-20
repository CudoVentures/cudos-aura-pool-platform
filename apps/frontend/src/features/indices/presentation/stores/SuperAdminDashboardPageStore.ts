import TableState from '../../../../core/presentation/stores/TableState';
import { makeAutoObservable, runInAction } from 'mobx';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import DefaultIntervalPickerState from '../../../analytics/presentation/stores/DefaultIntervalPickerState';
import MiningFarmPerformanceEntity from '../../../mining-farm/entities/MiningFarmPerformanceEntity';

export default class SuperAdminDashboardPageStore {
    miningFarmRepo: MiningFarmRepo;
    collectionRepo: CollectionRepo;
    walletStore: WalletStore;
    accountSessionStore: AccountSessionStore;
    alertStore: AlertStore;

    topFarmsTableState: TableState;
    defaultIntervalPickerState: DefaultIntervalPickerState;

    bestPerformingMiningFarms: MiningFarmEntity[];
    miningFarmPerformanceEntitiesMap: Map < string, MiningFarmPerformanceEntity >;

    constructor(miningFarmRepo: MiningFarmRepo, collectionRepo: CollectionRepo, walletStore: WalletStore, accountSessionStore: AccountSessionStore, alertStore: AlertStore) {
        this.miningFarmRepo = miningFarmRepo;
        this.collectionRepo = collectionRepo;
        this.walletStore = walletStore;
        this.accountSessionStore = accountSessionStore;
        this.alertStore = alertStore;

        this.defaultIntervalPickerState = new DefaultIntervalPickerState(this.fetchTopPerformingFarmEntities);
        this.topFarmsTableState = new TableState(0, [], this.fetchTopPerformingFarmEntities, Number.MAX_SAFE_INTEGER);

        this.bestPerformingMiningFarms = null;
        this.miningFarmPerformanceEntitiesMap = new Map();

        makeAutoObservable(this);
    }

    init(): void {
        this.fetchTopPerformingFarmEntities();
    }

    fetchTopPerformingFarmEntities = async (): Promise<void> => {
        const { miningFarmEntities, miningFarmPerformanceEntities } = await this.miningFarmRepo.fetchBestPerformingMiningFarm(this.defaultIntervalPickerState.earningsTimestampFrom, this.defaultIntervalPickerState.earningsTimestampTo);
        const miningFarmPerformanceEntitiesMap = new Map();
        miningFarmPerformanceEntities.forEach((miningFarmPerformanceEntity) => {
            miningFarmPerformanceEntitiesMap.set(miningFarmPerformanceEntity.miningFarmId, miningFarmPerformanceEntity);
        });

        runInAction(() => {
            this.bestPerformingMiningFarms = miningFarmEntities;
            this.miningFarmPerformanceEntitiesMap = miningFarmPerformanceEntitiesMap;
            this.topFarmsTableState.tableFilterState.total = miningFarmEntities.length; // no paging here
        })
    }

    getMiningFarmPerformanceEntity(miningFarmId: string): MiningFarmPerformanceEntity {
        return this.miningFarmPerformanceEntitiesMap.get(miningFarmId) ?? null;
    }
}
