import { makeAutoObservable, runInAction } from 'mobx';
import TableState from '../../../../core/presentation/stores/TableState';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import StatisticsRepo from '../repos/StatisticsRepo';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import { MiningFarmStatus } from '../../../mining-farm/entities/MiningFarmEntity';
import MiningFarmEarningsEntity from '../../entities/MiningFarmEarningsEntity';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftEntity from '../../../nft/entities/NftEntity';
import NftEventEntity from '../../entities/NftEventEntity';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';

export default class AnalyticsPageStore {
    statisticsRepo: StatisticsRepo;
    nftRepo: NftRepo;
    collectionRepo: CollectionRepo;
    miningFarmRepo: MiningFarmRepo;

    miningFarmEarningsEntity: MiningFarmEarningsEntity;

    earningsTimestampFrom: number;
    earningsTimestampTo: number;

    nftEventFilterModel: NftEventFilterModel;
    nftEventEntities: NftEventEntity[];
    nftEntitiesMap: Map < string, NftEntity >;
    analyticsTableState: TableState;

    constructor(statisticsRepo: StatisticsRepo, nftRepo: NftRepo, collectionRepo: CollectionRepo, miningFarmRepo: MiningFarmRepo) {
        this.statisticsRepo = statisticsRepo;
        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.miningFarmEarningsEntity = null;

        this.earningsTimestampFrom = 0;
        this.earningsTimestampTo = 0;
        this.markEarningsTimestampToday();

        this.nftEventFilterModel = new NftEventFilterModel();
        this.nftEventEntities = null;
        this.nftEntitiesMap = new Map();
        this.analyticsTableState = new TableState(0, [], this.fetchNftEvents, 10);

        makeAutoObservable(this);
    }

    async init() {
        const miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId(MiningFarmStatus.ANY);
        this.nftEventFilterModel.miningFarmId = miningFarmEntity.id;

        await this.fetchEarnings();
        await this.fetchNftEvents();
    }

    async fetchEarnings() {
        this.miningFarmEarningsEntity = await this.statisticsRepo.fetchNftEarningsByMiningFarmId(this.nftEventFilterModel.miningFarmId, this.earningsTimestampFrom, this.earningsTimestampTo);
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

        if (nftIds.length > 0) {
            const nftEntities = await this.nftRepo.fetchNftByIds(nftIds);

            const nftEntitiesMap = this.nftEntitiesMap;
            this.nftEntitiesMap = null;
            nftEntities.forEach((nftEntity) => {
                nftEntitiesMap.set(nftEntity.id, nftEntity);
            });

            runInAction(() => {
                this.nftEntitiesMap = nftEntitiesMap;
            });
        }

        runInAction(() => {
            this.nftEventEntities = nftEventEntities;
            this.analyticsTableState.tableFilterState.total = total;
        });
    }

    markEarningsTimestampToday() {
        const { timestampFrom, timestampTo } = ProjectUtils.makeTimestampsToday();
        this.earningsTimestampFrom = timestampFrom;
        this.earningsTimestampTo = timestampTo;
    }

    markEarningsTimestampWeek() {
        const { timestampFrom, timestampTo } = ProjectUtils.makeTimestampsWeek();
        this.earningsTimestampFrom = timestampFrom;
        this.earningsTimestampTo = timestampTo;
    }

    markEarningsTimestampMonth() {
        const { timestampFrom, timestampTo } = ProjectUtils.makeTimestampsMonth();
        this.earningsTimestampFrom = timestampFrom;
        this.earningsTimestampTo = timestampTo;
    }

    getNftById(nftId: string): NftEntity {
        return this.nftEntitiesMap.get(nftId) ?? null;
    }

    onChangeTableFilter = (value: number) => {
        this.nftEventFilterModel.eventType = value;
    }
}
