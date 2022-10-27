import { makeAutoObservable, runInAction } from 'mobx';
import TableState from '../../../../core/presentation/stores/TableState';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import CollectionEventFilterModel from '../../entities/CollectionEventFilterModel';
import CollectionEventEntity from '../../entities/CollectionEventEntity';
import PoolEventRepo from '../repos/PoolEventRepo';
import CollectionEntity from '../../../collection/entities/CollectionEntity';

enum StatPeriod {
    TODAY = 1,
    WEEK = 2,
    MONTH = 3
}

export default class AnalyticsPageStore {
    poolEventRepo: PoolEventRepo;
    collectionRepo: CollectionRepo;

    statPeriod: StatPeriod;
    collectionEventFilterModel: CollectionEventFilterModel;
    analyticsTableState: TableState;

    collectionEventEntities: CollectionEventEntity[];
    collectionEntities: CollectionEntity[];

    constructor(poolEventRepo: PoolEventRepo, collectionRepo: CollectionRepo) {
        this.poolEventRepo = poolEventRepo;
        this.collectionRepo = collectionRepo;

        this.setStatsToday();
        this.collectionEventFilterModel = new CollectionEventFilterModel();
        this.analyticsTableState = new TableState(0, [], this.fetch, 10);

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
        const { collectionEventEntities, total } = await this.poolEventRepo.fetchCollectionEventsByFilter(this.collectionEventFilterModel);
        const collectionEntities = await this.collectionRepo.fetchCollectionsByIds(collectionEventEntities.map((eventEntity: CollectionEventEntity) => eventEntity.collectionId));

        runInAction(() => {
            this.collectionEventEntities = collectionEventEntities;
            this.collectionEntities = collectionEntities;
            this.analyticsTableState.tableFilterState.total = total;
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
