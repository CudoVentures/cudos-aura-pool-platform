import TableState from '../../../core/presentation/stores/TableState';
import { makeAutoObservable } from 'mobx';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import DefaultIntervalPickerState from '../../../analytics/presentation/stores/DefaultIntervalPickerState';
import MiningFarmPerformanceEntity from '../../../mining-farm/entities/MiningFarmPerformanceEntity';
import StatisticsRepo from '../../../analytics/presentation/repos/StatisticsRepo';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import EarningsPerDayEntity from '../../../analytics/entities/EarningsPerDayEntity';
import PlatformTotalEarningsBtcEntity from '../../../analytics/entities/PlatformTotalEarningsBtcEntity';
import PlatformTotalEarningsCudosEntity from '../../../analytics/entities/PlatformTotalEarningsCudosEntity';
import EarningsPerDayFilterEntity from '../../../analytics/entities/EarningsPerDayFilterEntity';
import BigNumber from 'bignumber.js';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';

export default class SuperAdminDashboardPageStore {

    bitcoinStore: BitcoinStore;
    cudosStore: CudosStore;
    accountSessionStore: AccountSessionStore;
    alertStore: AlertStore;

    miningFarmRepo: MiningFarmRepo;
    collectionRepo: CollectionRepo;
    statisticsRepo: StatisticsRepo;

    earningsPerDayFilterEntity: EarningsPerDayFilterEntity;
    earningsPerDayEntity: EarningsPerDayEntity;
    platformTotalEarningsBtcEntity: PlatformTotalEarningsBtcEntity;
    platformTotalEarningsCudosEntity: PlatformTotalEarningsCudosEntity;

    topFarmsTableState: TableState;
    farmsDefaultIntervalPickerState: DefaultIntervalPickerState;
    bestPerformingMiningFarms: MiningFarmEntity[];
    miningFarmPerformanceEntitiesMap: Map < string, MiningFarmPerformanceEntity >;

    constructor(bitcoinStore: BitcoinStore, cudosStore: CudosStore, accountSessionStore: AccountSessionStore, alertStore: AlertStore, statisticsRepo: StatisticsRepo, miningFarmRepo: MiningFarmRepo, collectionRepo: CollectionRepo) {
        this.bitcoinStore = bitcoinStore;
        this.cudosStore = cudosStore;
        this.accountSessionStore = accountSessionStore;
        this.alertStore = alertStore;

        this.miningFarmRepo = miningFarmRepo;
        this.collectionRepo = collectionRepo;
        this.statisticsRepo = statisticsRepo;

        this.earningsPerDayFilterEntity = new EarningsPerDayFilterEntity();
        this.earningsPerDayEntity = null;
        this.platformTotalEarningsBtcEntity = null;
        this.platformTotalEarningsCudosEntity = null;

        this.topFarmsTableState = new TableState(0, [], this.fetchTopPerformingFarmEntities, Number.MAX_SAFE_INTEGER);
        this.farmsDefaultIntervalPickerState = new DefaultIntervalPickerState(this.fetchTopPerformingFarmEntities);
        this.bestPerformingMiningFarms = null;
        this.miningFarmPerformanceEntitiesMap = new Map();

        makeAutoObservable(this);
    }

    async init(): Promise < void > {
        await Promise.all([
            this.bitcoinStore.init(),
            this.cudosStore.init(),
            this.fetchEarnings(),
            this.fetchTopPerformingFarmEntities(),
            this.fetchAggregatedStatistics(),
        ]);
    }

    private async fetchEarnings() {
        const earningsPerDayEntity = await this.statisticsRepo.fetchEarningsPerDay(this.earningsPerDayFilterEntity);

        await runInActionAsync(() => {
            this.earningsPerDayEntity = earningsPerDayEntity;
        })
    }

    private async fetchAggregatedStatistics() {
        const platformTotalEarningsBtcEntity = await this.statisticsRepo.fetchPlatformTotalEarningsBtc();
        const platformTotalEarningsCudosEntity = await this.statisticsRepo.fetchPlatformTotalEarningsCudos();
        await runInActionAsync(() => {
            this.platformTotalEarningsBtcEntity = platformTotalEarningsBtcEntity;
            this.platformTotalEarningsCudosEntity = platformTotalEarningsCudosEntity;
        });
    }

    fetchTopPerformingFarmEntities = async (): Promise<void> => {
        const { miningFarmEntities, miningFarmPerformanceEntities } = await this.miningFarmRepo.fetchBestPerformingMiningFarm(this.farmsDefaultIntervalPickerState.earningsTimestampFrom, this.farmsDefaultIntervalPickerState.earningsTimestampTo);
        const miningFarmPerformanceEntitiesMap = new Map();
        miningFarmPerformanceEntities.forEach((miningFarmPerformanceEntity) => {
            miningFarmPerformanceEntitiesMap.set(miningFarmPerformanceEntity.miningFarmId, miningFarmPerformanceEntity);
        });

        await runInActionAsync(() => {
            this.bestPerformingMiningFarms = miningFarmEntities;
            this.miningFarmPerformanceEntitiesMap = miningFarmPerformanceEntitiesMap;
            this.topFarmsTableState.tableFilterState.setTotal(miningFarmEntities.length) // no paging here
        })
    }

    getMiningFarmPerformanceEntity(miningFarmId: string): MiningFarmPerformanceEntity {
        return this.miningFarmPerformanceEntitiesMap.get(miningFarmId) ?? null;
    }

    getTotalSalesInUsd() {
        const nftFeesTotalEarningsInBtc = this.platformTotalEarningsBtcEntity?.nftFeesTotalEarningsInBtc ?? new BigNumber(0);
        const resaleRoyaltiesTotalEarningsInAcudos = this.platformTotalEarningsCudosEntity?.totalEarningsInAcudos() ?? new BigNumber(0);

        const nftFeesTotalEarningsInUsd = this.bitcoinStore.convertBtcInUsd(nftFeesTotalEarningsInBtc);
        const resaleRoyaltiesTotalEarningsInUsd = this.cudosStore.convertAcudosInUsd(resaleRoyaltiesTotalEarningsInAcudos);
        return nftFeesTotalEarningsInUsd.plus(resaleRoyaltiesTotalEarningsInUsd);
    }

    getEarnings(): number[] {
        return this.earningsPerDayEntity?.btcEarningsPerDay.map((btcValue, i) => {
            const acudosValue = this.earningsPerDayEntity.cudosEarningsPerDay[i];

            const btcToUsd = this.bitcoinStore.convertBtcInUsd(btcValue);
            const acudosToUsd = this.cudosStore.convertCudosInUsd(acudosValue);
            return btcToUsd.plus(acudosToUsd).toNumber();
        }) ?? [];
    }
}
