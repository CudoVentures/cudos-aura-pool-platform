import { action, makeAutoObservable, runInAction } from 'mobx';
import TableState from '../../../core/presentation/stores/TableState';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import StatisticsRepo from '../repos/StatisticsRepo';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftEntity from '../../../nft/entities/NftEntity';
import NftEventEntity, { NftEventType } from '../../entities/NftEventEntity';
import S from '../../../core/utilities/Main';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import MiningFarmMaintenanceFeeEntity from '../../entities/MiningFarmMaintenanceFeeEntity';
import MiningFarmTotalEarningsBtcEntity from '../../entities/MiningFarmTotalEarningsBtcEntity';
import MiningFarmTotalEarningsCudosEntity from '../../entities/MiningFarmTotalEarningsCudosEntity';
import EarningsPerDayFilterEntity from '../../entities/EarningsPerDayFilterEntity';
import { RangeDatepickerState } from '../../../core/presentation/components/RangeDatepicker';
import EarningsPerDayEntity from '../../entities/EarningsPerDayEntity';
import CollectionEntity from '../../../collection/entities/CollectionEntity';

export default class AnalyticsPageStore {

    bitcoinStore: BitcoinStore;
    cudosStore: CudosStore;

    statisticsRepo: StatisticsRepo;
    nftRepo: NftRepo;
    collectionRepo: CollectionRepo;
    miningFarmRepo: MiningFarmRepo;

    filterCollectionEntities: CollectionEntity[];

    earningsPerDayFilterEntity: EarningsPerDayFilterEntity;
    earningRangeState: RangeDatepickerState;
    earningsPerDayEntity: EarningsPerDayEntity;
    miningFarmMaintenanceFeeEntitiesMap: Map < string, MiningFarmMaintenanceFeeEntity >;
    miningFarmTotalEarningsBtcEntitiesMap: Map < string, MiningFarmTotalEarningsBtcEntity >;
    miningFarmTotalEarningsCudosEntitiesMap: Map < string, MiningFarmTotalEarningsCudosEntity >;

    eventType: NftEventType;
    nftEventFilterModel: NftEventFilterModel;
    nftEventEntities: NftEventEntity[];
    nftEntitiesMap: Map < string, NftEntity >;
    analyticsTableState: TableState;

    constructor(bitcoinStore: BitcoinStore, cudosStore: CudosStore, statisticsRepo: StatisticsRepo, nftRepo: NftRepo, collectionRepo: CollectionRepo, miningFarmRepo: MiningFarmRepo) {
        this.bitcoinStore = bitcoinStore;
        this.cudosStore = cudosStore;

        this.statisticsRepo = statisticsRepo;
        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.filterCollectionEntities = null;

        this.earningsPerDayFilterEntity = new EarningsPerDayFilterEntity();
        this.earningRangeState = new RangeDatepickerState(this.earningsPerDayFilterEntity.timestampFrom, this.earningsPerDayFilterEntity.timestampTo);

        this.earningsPerDayEntity = null;
        this.miningFarmMaintenanceFeeEntitiesMap = new Map();
        this.miningFarmTotalEarningsBtcEntitiesMap = new Map();
        this.miningFarmTotalEarningsCudosEntitiesMap = new Map();

        this.eventType = S.NOT_EXISTS;
        this.nftEventFilterModel = new NftEventFilterModel();
        this.nftEventEntities = null;
        this.nftEntitiesMap = new Map();
        this.analyticsTableState = new TableState(0, [], this.fetchNftEvents, 10);

        makeAutoObservable(this, { nftEventFilterModel: false });
    }

    async init() {
        await this.bitcoinStore.init();
        await this.cudosStore.init();

        const miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId();
        this.earningsPerDayFilterEntity.farmId = miningFarmEntity.id;
        this.nftEventFilterModel.miningFarmId = miningFarmEntity.id;
        await this.fetchFilterCollections();
        await this.fetchEarnings();
        await this.fetchAggregatedStatistics();
        await this.fetchNftEvents();
    }

    async fetchFilterCollections() {
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

        const miningFarmId = earningsPerDayFilterEntity.farmId;
        const collectionId = earningsPerDayFilterEntity.getSelectedCollection();
        if (earningsPerDayFilterEntity.isBtc() === true || earningsPerDayFilterEntity.isUsd() === true) {
            let miningFarmTotalEarningsBtcEntity = this.getMiningFarmTotalEarningsBtc();
            if (miningFarmTotalEarningsBtcEntity === null) {
                miningFarmTotalEarningsBtcEntity = await this.statisticsRepo.fetchMiningFarmTotalEarningsBtc(miningFarmId, collectionId);
                runInAction(() => {
                    const cacheMap = this.miningFarmTotalEarningsBtcEntitiesMap;
                    this.miningFarmTotalEarningsBtcEntitiesMap = null;

                    cacheMap.set(collectionId, miningFarmTotalEarningsBtcEntity);

                    this.miningFarmTotalEarningsBtcEntitiesMap = cacheMap;
                });
            }
        }

        if (earningsPerDayFilterEntity.isCudos() === true || earningsPerDayFilterEntity.isUsd() === true) {
            let miningFarmTotalEarningsCudosEntity = this.getMiningFarmTotalEarningsCudos();
            if (miningFarmTotalEarningsCudosEntity === null) {
                miningFarmTotalEarningsCudosEntity = await this.statisticsRepo.fetchMiningFarmTotalEarningsCudos(miningFarmId, collectionId);
                runInAction(() => {
                    const cacheMap = this.miningFarmTotalEarningsCudosEntitiesMap;
                    this.miningFarmTotalEarningsCudosEntitiesMap = null;

                    cacheMap.set(collectionId, miningFarmTotalEarningsCudosEntity);

                    this.miningFarmTotalEarningsCudosEntitiesMap = cacheMap;
                })
            }
        }

        let miningFarmMaintenanceFeeEntity = this.getMiningFarmMaintenanceFee();
        if (miningFarmMaintenanceFeeEntity === null) {
            miningFarmMaintenanceFeeEntity = await this.statisticsRepo.fetchMiningFarmMaintenanceFee(miningFarmId, collectionId);
            runInAction(() => {
                const cacheMap = this.miningFarmMaintenanceFeeEntitiesMap;
                this.miningFarmMaintenanceFeeEntitiesMap = null;

                cacheMap.set(collectionId, miningFarmMaintenanceFeeEntity);

                this.miningFarmMaintenanceFeeEntitiesMap = cacheMap;
            });
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
        const collectionId = this.earningsPerDayFilterEntity.getSelectedCollection();
        return this.miningFarmMaintenanceFeeEntitiesMap.get(collectionId) ?? null;
    }

    getMiningFarmTotalEarningsBtc(): MiningFarmTotalEarningsBtcEntity {
        const collectionId = this.earningsPerDayFilterEntity.getSelectedCollection();
        return this.miningFarmTotalEarningsBtcEntitiesMap.get(collectionId) ?? null;
    }

    getMiningFarmTotalEarningsCudos(): MiningFarmTotalEarningsCudosEntity {
        const collectionId = this.earningsPerDayFilterEntity.getSelectedCollection();
        return this.miningFarmTotalEarningsCudosEntitiesMap.get(collectionId) ?? null;
    }

    changeFilterCollection(collectionId: string) {
        this.earningsPerDayFilterEntity.collectionIds = [collectionId];
        this.fetchEarnings();
        this.fetchAggregatedStatistics();
    }

    changeCurrency(currency) {
        this.earningsPerDayFilterEntity.currency = currency;
        this.fetchEarnings();
        this.fetchAggregatedStatistics();
    }

    onChangeTableFilter = action((value: number) => {
        this.eventType = value;
    })
}
