import { makeAutoObservable, runInAction } from 'mobx';
import TableState from '../../../../core/presentation/stores/TableState';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import CollectionEventFilterModel from '../../entities/CollectionEventFilterModel';
import CollectionEventEntity from '../../entities/CollectionEventEntity';
import PoolEventRepo from '../repos/PoolEventRepo';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import ExtendedChartState from '../../../../core/presentation/stores/ExtendedChartState';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';

export default class AnalyticsPageStore {
    poolEventRepo: PoolEventRepo;
    collectionRepo: CollectionRepo;
    miningFarmRepo: MiningFarmRepo;

    collectionEventFilterModel: CollectionEventFilterModel;
    analyticsTableState: TableState;
    extendedChartState: ExtendedChartState;

    miningFarmEntity: MiningFarmEntity;
    collectionEventEntities: CollectionEventEntity[];
    collectionEntities: CollectionEntity[];

    constructor(poolEventRepo: PoolEventRepo, collectionRepo: CollectionRepo, miningFarmRepo: MiningFarmRepo) {
        this.poolEventRepo = poolEventRepo;
        this.collectionRepo = collectionRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.collectionEventFilterModel = new CollectionEventFilterModel();
        this.analyticsTableState = new TableState(0, [], this.fetch, 10);
        this.extendedChartState = new ExtendedChartState(this.fetchStatistics);

        this.miningFarmEntity = null;
        this.collectionEventEntities = [];
        this.collectionEntities = [];

        makeAutoObservable(this);
    }

    async init() {
        this.miningFarmEntity = null;
        this.collectionEventEntities = [];
        this.collectionEntities = [];

        this.fetch();
    }

    fetch = async () => {
        const miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId();
        const { collectionEventEntities, total } = await this.poolEventRepo.fetchCollectionEventsByFilter(this.collectionEventFilterModel);
        const collectionEntities = await this.collectionRepo.fetchCollectionsByIds(collectionEventEntities.map((eventEntity: CollectionEventEntity) => eventEntity.collectionId));

        runInAction(() => {
            this.miningFarmEntity = miningFarmEntity;
            this.collectionEventEntities = collectionEventEntities;
            this.collectionEntities = collectionEntities;
            this.analyticsTableState.tableFilterState.total = total;
            this.extendedChartState.init();
        });
    }

    fetchStatistics = async (timestamp: number): Promise < number[] > => {
        return this.miningFarmRepo.fetchMiningFarmSalesStatistics(this.miningFarmEntity.id, timestamp);
    }

    getCollectionById(collectionId: string): CollectionEntity {
        return this.collectionEntities.find((collectionEntity: CollectionEntity) => collectionEntity.id === collectionId);
    }

    onChangeTableFilter = (value: number) => {
        this.collectionEventFilterModel.eventType = value;
    }
}
