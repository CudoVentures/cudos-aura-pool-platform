import { makeAutoObservable, runInAction } from 'mobx';
import TableState from '../../../../core/presentation/stores/TableState';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import CollectionEventFilterModel from '../../entities/CollectionEventFilterModel';
import CollectionEventEntity from '../../entities/CollectionEventEntity';
import PoolEventRepo from '../repos/PoolEventRepo';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import ExtendedChartState from '../../../../core/presentation/stores/ExtendedChartState';
import MiningFarmEntity, { MiningFarmStatus } from '../../../mining-farm/entities/MiningFarmEntity';

export default class AnalyticsPageStore {
    poolEventRepo: PoolEventRepo;
    collectionRepo: CollectionRepo;
    miningFarmRepo: MiningFarmRepo;

    collectionEventFilterModel: CollectionEventFilterModel;
    analyticsTableState: TableState;
    extendedChartState: ExtendedChartState;

    miningFarmEntity: MiningFarmEntity;
    collectionEventEntities: CollectionEventEntity[];
    collectionEntitiesMap: Map < string, CollectionEntity >;

    constructor(poolEventRepo: PoolEventRepo, collectionRepo: CollectionRepo, miningFarmRepo: MiningFarmRepo) {
        this.poolEventRepo = poolEventRepo;
        this.collectionRepo = collectionRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.collectionEventFilterModel = new CollectionEventFilterModel();
        this.analyticsTableState = new TableState(0, [], this.fetch, 10);
        this.extendedChartState = new ExtendedChartState(this.fetchStatistics);

        this.miningFarmEntity = null;
        this.collectionEventEntities = [];
        this.collectionEntitiesMap = new Map();

        makeAutoObservable(this);
    }

    async init() {
        this.miningFarmEntity = null;
        this.collectionEventEntities = [];
        this.collectionEntitiesMap = new Map();

        this.fetch();
    }

    fetch = async () => {
        const miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId(MiningFarmStatus.ANY);
        const { collectionEventEntities, total } = await this.poolEventRepo.fetchCollectionEventsByFilter(this.collectionEventFilterModel);
        const collectionEntities = await this.collectionRepo.fetchCollectionsByIds(collectionEventEntities.map((eventEntity: CollectionEventEntity) => eventEntity.collectionId));

        const collectionEntitiesMap = new Map();
        collectionEntities.forEach((collectionEntity) => {
            collectionEntitiesMap.set(collectionEntity.id, collectionEntity);
        });

        runInAction(() => {
            this.miningFarmEntity = miningFarmEntity;
            this.collectionEventEntities = collectionEventEntities;
            this.collectionEntitiesMap = collectionEntitiesMap;
            this.analyticsTableState.tableFilterState.total = total;
            this.extendedChartState.init();
        });
    }

    fetchStatistics = async (timestamp: number): Promise < number[] > => {
        return this.miningFarmRepo.fetchMiningFarmSalesStatistics(this.miningFarmEntity.id, timestamp);
    }

    getCollectionById(collectionId: string): CollectionEntity {
        return this.collectionEntitiesMap.get(collectionId) ?? null;
    }

    onChangeTableFilter = (value: number) => {
        this.collectionEventFilterModel.eventType = value;
    }
}
