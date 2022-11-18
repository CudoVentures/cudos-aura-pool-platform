import { makeAutoObservable, runInAction } from 'mobx';
import TableState from '../../../../core/presentation/stores/TableState';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import StatisticsRepo from '../repos/StatisticsRepo';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import MiningFarmEarningsEntity from '../../entities/MiningFarmEarningsEntity';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftEntity from '../../../nft/entities/NftEntity';
import NftEventEntity from '../../entities/NftEventEntity';
import DefaultIntervalPickerState from './DefaultIntervalPickerState';
import { CollectionStatus } from '../../../collection/entities/CollectionEntity';

export default class AnalyticsPageStore {

    statisticsRepo: StatisticsRepo;
    nftRepo: NftRepo;
    collectionRepo: CollectionRepo;
    miningFarmRepo: MiningFarmRepo;

    defaultIntervalPickerState: DefaultIntervalPickerState;
    miningFarmEarningsEntity: MiningFarmEarningsEntity;

    nftEventFilterModel: NftEventFilterModel;
    nftEventEntities: NftEventEntity[];
    nftEntitiesMap: Map < string, NftEntity >;
    analyticsTableState: TableState;

    constructor(statisticsRepo: StatisticsRepo, nftRepo: NftRepo, collectionRepo: CollectionRepo, miningFarmRepo: MiningFarmRepo) {
        this.statisticsRepo = statisticsRepo;
        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.defaultIntervalPickerState = new DefaultIntervalPickerState(this.fetchEarnings);
        this.miningFarmEarningsEntity = null;

        this.nftEventFilterModel = new NftEventFilterModel();
        this.nftEventEntities = null;
        this.nftEntitiesMap = new Map();
        this.analyticsTableState = new TableState(0, [], this.fetchNftEvents, 10);

        makeAutoObservable(this);
    }

    async init() {
        const miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId();
        this.nftEventFilterModel.miningFarmId = miningFarmEntity.id;

        await this.fetchEarnings();
        await this.fetchNftEvents();
    }

    fetchEarnings = async () => {
        const defaultIntervalPickerState = this.defaultIntervalPickerState;
        this.miningFarmEarningsEntity = await this.statisticsRepo.fetchNftEarningsByMiningFarmId(this.nftEventFilterModel.miningFarmId, defaultIntervalPickerState.earningsTimestampFrom, defaultIntervalPickerState.earningsTimestampTo);
    }

    fetchNftEvents = async () => {
        this.nftEventFilterModel.from = this.analyticsTableState.tableFilterState.from;
        this.nftEventFilterModel.count = this.analyticsTableState.tableFilterState.itemsPerPage;
        const { nftEventEntities, total } = await this.statisticsRepo.fetchNftEvents(this.nftEventFilterModel);

        const nftIds = nftEventEntities.filter((nftEventEntity) => {
            return this.nftEntitiesMap.has(nftEventEntity.nftId) === false;
        }).map((nftEventEntity) => {
            return nftEventEntity.nftId;
        });

        const nftEntitiesMap = this.nftEntitiesMap;
        if (nftIds.length > 0) {
            const nftEntities = await this.nftRepo.fetchNftByIds(nftIds);

            nftEntities.forEach((nftEntity) => {
                nftEntitiesMap.set(nftEntity.id, nftEntity);
            });
        }

        runInAction(() => {
            this.nftEntitiesMap = nftEntitiesMap;
            this.nftEventEntities = nftEventEntities;
            this.analyticsTableState.tableFilterState.total = total;
        });
    }

    getNftById = (nftId: string): NftEntity => {
        return this.nftEntitiesMap.get(nftId) ?? null;
    }

    onChangeTableFilter = (value: number) => {
        this.nftEventFilterModel.eventType = value;
    }
}
