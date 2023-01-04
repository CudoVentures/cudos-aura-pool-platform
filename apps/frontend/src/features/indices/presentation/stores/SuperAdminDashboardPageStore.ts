import TableState from '../../../../core/presentation/stores/TableState';
import { makeAutoObservable, runInAction } from 'mobx';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import DefaultIntervalPickerState from '../../../analytics/presentation/stores/DefaultIntervalPickerState';
import MiningFarmPerformanceEntity from '../../../mining-farm/entities/MiningFarmPerformanceEntity';
import TotalEarningsEntity from '../../../analytics/entities/TotalEarningsEntity';
import StatisticsRepo from '../../../analytics/presentation/repos/StatisticsRepo';

export default class SuperAdminDashboardPageStore {
    miningFarmRepo: MiningFarmRepo;
    collectionRepo: CollectionRepo;
    statisticsRepo: StatisticsRepo;
    accountSessionStore: AccountSessionStore;
    alertStore: AlertStore;

    topFarmsTableState: TableState;
    earningsDefaultIntervalPickerState: DefaultIntervalPickerState;
    farmsDefaultIntervalPickerState: DefaultIntervalPickerState;

    bestPerformingMiningFarms: MiningFarmEntity[];
    miningFarmPerformanceEntitiesMap: Map < string, MiningFarmPerformanceEntity >;
    totalEarningsEntity: TotalEarningsEntity;

    constructor(statisticsRepo: StatisticsRepo, miningFarmRepo: MiningFarmRepo, collectionRepo: CollectionRepo, accountSessionStore: AccountSessionStore, alertStore: AlertStore) {
        this.miningFarmRepo = miningFarmRepo;
        this.collectionRepo = collectionRepo;
        this.statisticsRepo = statisticsRepo;
        this.accountSessionStore = accountSessionStore;
        this.alertStore = alertStore;

        this.topFarmsTableState = new TableState(0, [], this.fetchTopPerformingFarmEntities, Number.MAX_SAFE_INTEGER);
        this.earningsDefaultIntervalPickerState = new DefaultIntervalPickerState(this.fetchTotalEarnngsEntity);
        this.farmsDefaultIntervalPickerState = new DefaultIntervalPickerState(this.fetchTopPerformingFarmEntities);

        this.bestPerformingMiningFarms = null;
        this.miningFarmPerformanceEntitiesMap = new Map();
        this.totalEarningsEntity = null;

        makeAutoObservable(this);
    }

    init(): void {
        this.fetchTotalEarnngsEntity();
        this.fetchTopPerformingFarmEntities();
    }

    fetchTotalEarnngsEntity = async (): Promise<void> => {
        const totalEarningsEntity = await this.statisticsRepo.fetchTotalNftEarnings(this.earningsDefaultIntervalPickerState.earningsTimestampFrom, this.earningsDefaultIntervalPickerState.earningsTimestampTo);

        runInAction(() => {
            this.totalEarningsEntity = totalEarningsEntity;
        })
    }

    fetchTopPerformingFarmEntities = async (): Promise<void> => {
        const { miningFarmEntities, miningFarmPerformanceEntities } = await this.miningFarmRepo.fetchBestPerformingMiningFarm(this.farmsDefaultIntervalPickerState.earningsTimestampFrom, this.farmsDefaultIntervalPickerState.earningsTimestampTo);
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
