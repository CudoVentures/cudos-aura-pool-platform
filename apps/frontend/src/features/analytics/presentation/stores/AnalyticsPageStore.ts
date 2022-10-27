import { makeAutoObservable, runInAction } from 'mobx';
import TableState from '../../../../core/presentation/stores/TableState';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import CollectionEventFilterModel from '../../entities/CollectionEventFilterModel';
import CollectionEventEntity from '../../entities/CollectionEventEntity';
import PoolEventRepo from '../repos/PoolEventRepo';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';

enum StatPeriod {
    TODAY = 1,
    WEEK = 2,
    MONTH = 3
}

export default class AnalyticsPageStore {
    poolEventRepo: PoolEventRepo;
    collectionRepo: CollectionRepo;
    miningFarmRepo: MiningFarmRepo;

    statPeriod: StatPeriod;
    collectionEventFilterModel: CollectionEventFilterModel;
    analyticsTableState: TableState;

    statistics: number[];
    collectionEventEntities: CollectionEventEntity[];
    collectionEntities: CollectionEntity[];

    constructor(poolEventRepo: PoolEventRepo, collectionRepo: CollectionRepo, miningFarmRepo: MiningFarmRepo) {
        this.poolEventRepo = poolEventRepo;
        this.collectionRepo = collectionRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.setStatsToday();
        this.collectionEventFilterModel = new CollectionEventFilterModel();
        this.analyticsTableState = new TableState(0, [], this.fetch, 10);

        this.statistics = [];
        this.collectionEventEntities = [];
        this.collectionEntities = [];

        makeAutoObservable(this);
    }

    async init() {
        this.collectionEventEntities = [];
        this.collectionEntities = [];

        await this.fetch();
    }

    fetch = async () => {
        const farmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId();
        const { collectionEventEntities, total } = await this.poolEventRepo.fetchCollectionEventsByFilter(this.collectionEventFilterModel);
        const collectionEntities = await this.collectionRepo.fetchCollectionsByIds(collectionEventEntities.map((eventEntity: CollectionEventEntity) => eventEntity.collectionId));
        const statistics = await this.miningFarmRepo.fetchMiningFarmSalesStatistics(farmEntity.id);

        runInAction(() => {
            this.collectionEventEntities = collectionEventEntities;
            this.collectionEntities = collectionEntities;
            this.analyticsTableState.tableFilterState.total = total;
            this.statistics = statistics;
        });
    }

    isStatsToday(): boolean {
        return this.statPeriod === StatPeriod.TODAY;
    }

    isStatsWeek(): boolean {
        return this.statPeriod === StatPeriod.WEEK;
    }

    isStatsMonth(): boolean {
        return this.statPeriod === StatPeriod.MONTH;
    }

    getCollectionById(collectionId: string): CollectionEntity {
        console.log(collectionId);
        console.log(this.collectionEntities);
        return this.collectionEntities.find((collectionEntity: CollectionEntity) => collectionEntity.id === collectionId);
    }

    setStatsToday = () => {
        this.statPeriod = StatPeriod.TODAY;
    }

    setStatsWeek = () => {
        this.statPeriod = StatPeriod.WEEK;
    }

    setStatsMonth = () => {
        this.statPeriod = StatPeriod.MONTH;
    }

    onChangeTableFilter = (value: number) => {
        this.collectionEventFilterModel.eventType = value;
    }
}
