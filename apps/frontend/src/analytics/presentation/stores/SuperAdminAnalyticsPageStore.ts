import { makeAutoObservable, runInAction } from 'mobx';
import TableState from '../../../core/presentation/stores/TableState';
import StatisticsRepo from '../repos/StatisticsRepo';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import NftEntity from '../../../nft/entities/NftEntity';
import NftEventEntity, { NftEventType } from '../../entities/NftEventEntity';
import S from '../../../core/utilities/Main';
import EarningsPerDayFilterEntity from '../../entities/EarningsPerDayFilterEntity';
import { RangeDatepickerState } from '../../../core/presentation/components/RangeDatepicker';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import EarningsPerDayEntity from '../../entities/EarningsPerDayEntity';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import PlatformMaintenanceFeeEntity from '../../entities/PlatformMaintenanceFeeEntity';
import PlatformTotalEarningsBtcEntity from '../../entities/PlatformTotalEarningsBtcEntity';
import PlatformTotalEarningsCudosEntity from '../../entities/PlatformTotalEarningsCudosEntity';
import MiningFarmMaintenanceFeeEntity from '../../entities/MiningFarmMaintenanceFeeEntity';
import MiningFarmTotalEarningsBtcEntity from '../../entities/MiningFarmTotalEarningsBtcEntity';
import MiningFarmTotalEarningsCudosEntity from '../../entities/MiningFarmTotalEarningsCudosEntity';

export default class SuperAdminAnalyticsPageStore {

    bitcoinStore: BitcoinStore;
    cudosStore: CudosStore;

    miningFarmRepo: MiningFarmRepo;
    collectionRepo: CollectionRepo;
    statisticsRepo: StatisticsRepo;

    filterMiningFarmEntities: MiningFarmEntity[];
    filterCollectionEntities: CollectionEntity[];

    earningsPerDayFilterEntity: EarningsPerDayFilterEntity;
    earningRangeState: RangeDatepickerState;
    earningsPerDayEntity: EarningsPerDayEntity;
    miningFarmMaintenanceFeeEntitiesMap: Map < string, MiningFarmMaintenanceFeeEntity >
    miningFarmTotalEarningsBtcEntitiesMap: Map < string, MiningFarmTotalEarningsBtcEntity >;
    miningFarmTotalEarningsCudosEntitiesMap: Map < string, MiningFarmTotalEarningsCudosEntity >;
    platformMaintenanceFeeEntity: PlatformMaintenanceFeeEntity;
    platformTotalEarningsBtcEntity: PlatformTotalEarningsBtcEntity;
    platformTotalEarningsCudosEntity: PlatformTotalEarningsCudosEntity;

    eventType: NftEventType;
    nftEventFilterModel: NftEventFilterModel;
    nftEventEntities: NftEventEntity[];
    nftEntitiesMap: Map < string, NftEntity >;
    analyticsTableState: TableState;

    constructor(bitcoinStore: BitcoinStore, cudosStore: CudosStore, miningFarmRepo: MiningFarmRepo, collectionRepo: CollectionRepo, statisticsRepo: StatisticsRepo) {
        this.bitcoinStore = bitcoinStore;
        this.cudosStore = cudosStore;

        this.miningFarmRepo = miningFarmRepo;
        this.collectionRepo = collectionRepo;
        this.statisticsRepo = statisticsRepo;

        this.filterMiningFarmEntities = null;
        this.filterCollectionEntities = null;

        this.earningsPerDayFilterEntity = new EarningsPerDayFilterEntity();
        this.earningRangeState = new RangeDatepickerState(this.earningsPerDayFilterEntity.timestampFrom, this.earningsPerDayFilterEntity.timestampTo);

        this.earningsPerDayEntity = null;
        this.miningFarmMaintenanceFeeEntitiesMap = new Map();
        this.miningFarmTotalEarningsBtcEntitiesMap = new Map();
        this.miningFarmTotalEarningsCudosEntitiesMap = new Map();
        this.platformMaintenanceFeeEntity = null;
        this.platformTotalEarningsBtcEntity = null;
        this.platformTotalEarningsCudosEntity = null;

        this.eventType = S.NOT_EXISTS;
        this.nftEventFilterModel = new NftEventFilterModel();
        this.nftEventEntities = null;
        this.nftEntitiesMap = new Map();
        this.analyticsTableState = new TableState(0, [], this.fetchNftEvents, 10);

        makeAutoObservable(this);
    }

    async init() {
        await this.bitcoinStore.init();
        await this.cudosStore.init();
        await this.fetchFilterMiningFarms();
        await this.fetchEarnings();
        await this.fetchAggregatedStatistics();
        await this.fetchNftEvents();
    }

    async fetchFilterMiningFarms() {
        const miningFarmEntities = await this.miningFarmRepo.fetchAllMiningFarms();
        runInAction(() => {
            this.filterMiningFarmEntities = miningFarmEntities;
        })
    }

    async fetchFilterCollections() {
        const miningFarmId = this.earningsPerDayFilterEntity.farmId;
        if (miningFarmId === S.Strings.NOT_EXISTS) {
            this.filterCollectionEntities = null;
            return;
        }

        const collectionEntities = await this.collectionRepo.fetchCollectionsByMiningFarmId(this.earningsPerDayFilterEntity.farmId);

        runInAction(() => {
            this.filterCollectionEntities = collectionEntities;
        });
    }

    private async fetchEarnings() {
        this.earningsPerDayFilterEntity.timestampFrom = this.earningRangeState.startDate;
        this.earningsPerDayFilterEntity.timestampTo = this.earningRangeState.endDate;

        const earningsPerDayEntity = await this.statisticsRepo.fetchEarningsPerDay(this.earningsPerDayFilterEntity);

        runInAction(() => {
            this.earningsPerDayEntity = earningsPerDayEntity;
        })
    }

    private async fetchAggregatedStatistics() {
        const earningsPerDayFilterEntity = this.earningsPerDayFilterEntity

        if (earningsPerDayFilterEntity.isPlatform() === true) {
            if (earningsPerDayFilterEntity.isBtc() === true || earningsPerDayFilterEntity.isUsd() === true) {
                if (this.platformTotalEarningsBtcEntity === null) {
                    const platformTotalEarningsBtcEntity = await this.statisticsRepo.fetchPlatformTotalEarningsBtc();
                    runInAction(() => {
                        this.platformTotalEarningsBtcEntity = platformTotalEarningsBtcEntity;
                    });
                }
            }

            if (earningsPerDayFilterEntity.isCudos() === true || earningsPerDayFilterEntity.isUsd() === true) {
                if (this.platformTotalEarningsCudosEntity === null) {
                    const platformTotalEarningsCudosEntity = await this.statisticsRepo.fetchPlatformTotalEarningsCudos();
                    runInAction(() => {
                        this.platformTotalEarningsCudosEntity = platformTotalEarningsCudosEntity;
                    })
                }
            }

            if (this.platformMaintenanceFeeEntity === null) {
                const platformMaintenanceFeeEntity = await this.statisticsRepo.fetchPlatformMaintenanceFee();
                runInAction(() => {
                    this.platformMaintenanceFeeEntity = platformMaintenanceFeeEntity;
                });
            }
        } else {
            const miningFarmId = earningsPerDayFilterEntity.farmId;
            if (earningsPerDayFilterEntity.isBtc() === true || earningsPerDayFilterEntity.isUsd() === true) {
                let miningFarmTotalEarningsBtcEntity = this.getMiningFarmTotalEarningsBtc();
                if (miningFarmTotalEarningsBtcEntity === null) {
                    miningFarmTotalEarningsBtcEntity = await this.statisticsRepo.fetchMiningFarmTotalEarningsBtc(miningFarmId);
                    runInAction(() => {
                        this.miningFarmTotalEarningsBtcEntitiesMap.set(miningFarmId, miningFarmTotalEarningsBtcEntity);
                    });
                }
            }

            if (earningsPerDayFilterEntity.isCudos() === true || earningsPerDayFilterEntity.isUsd() === true) {
                let miningFarmTotalEarningsCudosEntity = this.getMiningFarmTotalEarningsCudos();
                if (miningFarmTotalEarningsCudosEntity === null) {
                    miningFarmTotalEarningsCudosEntity = await this.statisticsRepo.fetchMiningFarmTotalEarningsCudos(miningFarmId);
                    runInAction(() => {
                        this.miningFarmTotalEarningsCudosEntitiesMap.set(miningFarmId, miningFarmTotalEarningsCudosEntity);
                    })
                }
            }

            let miningFarmMaintenanceFeeEntity = this.getMiningFarmMaintenanceFee();
            if (miningFarmMaintenanceFeeEntity === null) {
                miningFarmMaintenanceFeeEntity = await this.statisticsRepo.fetchMiningFarmMaintenanceFee(miningFarmId);
                runInAction(() => {
                    this.miningFarmMaintenanceFeeEntitiesMap.set(miningFarmId, miningFarmMaintenanceFeeEntity);
                });
            }
        }
    }

    fetchNftEvents = async () => {
        if (this.eventType !== S.NOT_EXISTS) {
            this.nftEventFilterModel.eventTypes = [this.eventType];
        }

        this.nftEventFilterModel.from = this.analyticsTableState.tableFilterState.from;
        this.nftEventFilterModel.count = this.analyticsTableState.tableFilterState.itemsPerPage;
        const { nftEventEntities, nftEntities, total } = await this.statisticsRepo.fetchNftEvents(this.nftEventFilterModel);

        const nftEntitiesMap = this.nftEntitiesMap;
        nftEntities.forEach((nftEntity) => {
            nftEntitiesMap.set(nftEntity.id, nftEntity);
        });

        runInAction(() => {
            this.nftEntitiesMap = nftEntitiesMap;
            this.nftEventEntities = nftEventEntities;
            this.analyticsTableState.tableFilterState.total = total;
        });
    }

    getNftById = (nftId: string): NftEntity => {
        return this.nftEntitiesMap.get(nftId) ?? null;
    }

    getEarnings(): number[] {
        if (this.earningsPerDayFilterEntity.isBtc() === true) {
            return this.earningsPerDayEntity?.btcEarningsPerDay.map((bn) => bn.toNumber()) ?? [];
        }

        if (this.earningsPerDayFilterEntity.isCudos() === true) {
            return this.earningsPerDayEntity?.cudosEarningsPerDay.map((bn) => bn.toNumber()) ?? [];
        }

        return this.earningsPerDayEntity?.btcEarningsPerDay.map((btcValue, i) => {
            const acudosValue = this.earningsPerDayEntity.cudosEarningsPerDay[i];

            const btcToUsd = this.bitcoinStore.convertBtcInUsd(btcValue);
            const acudosToUsd = this.cudosStore.convertCudosInUsd(acudosValue);
            return btcToUsd.plus(acudosToUsd).toNumber();
        }) ?? [];
    }

    getMiningFarmMaintenanceFee(): MiningFarmMaintenanceFeeEntity {
        const miningFarmId = this.earningsPerDayFilterEntity.farmId;
        return this.miningFarmMaintenanceFeeEntitiesMap.get(miningFarmId) ?? null;
    }

    getMiningFarmTotalEarningsBtc(): MiningFarmTotalEarningsBtcEntity {
        const miningFarmId = this.earningsPerDayFilterEntity.farmId;
        return this.miningFarmTotalEarningsBtcEntitiesMap.get(miningFarmId) ?? null;
    }

    getMiningFarmTotalEarningsCudos(): MiningFarmTotalEarningsCudosEntity {
        const miningFarmId = this.earningsPerDayFilterEntity.farmId;
        return this.miningFarmTotalEarningsCudosEntitiesMap.get(miningFarmId) ?? null;
    }

    getMaintenanceFeeEntity() {
        return this.earningsPerDayFilterEntity.isPlatform() ? this.platformMaintenanceFeeEntity : this.getMiningFarmMaintenanceFee();
    }

    changeFilterMiningFarm(miningFarmId: string) {
        this.earningsPerDayFilterEntity.farmId = miningFarmId;
        this.filterCollectionEntities = null;
        this.fetchFilterCollections();
        this.fetchEarnings();
        this.fetchAggregatedStatistics();
    }

    changeFilterCollection(collectionId: string) {
        this.earningsPerDayFilterEntity.collectionIds = [collectionId];
        this.fetchEarnings();
    }

    changeCurrency(currency) {
        this.earningsPerDayFilterEntity.currency = currency;
        this.fetchEarnings();
        this.fetchAggregatedStatistics();
    }

    onChangeTableFilter = (value: number) => {
        this.eventType = value;
        this.fetchNftEvents()
    }
}
