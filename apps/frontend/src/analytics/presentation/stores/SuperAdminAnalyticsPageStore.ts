import { makeAutoObservable, runInAction } from 'mobx';
import TableState from '../../../core/presentation/stores/TableState';
import StatisticsRepo from '../repos/StatisticsRepo';
import NftEventFilterModel from '../../entities/NftEventFilterModel';
import NftEntity from '../../../nft/entities/NftEntity';
import NftEventEntity, { NftEventType } from '../../entities/NftEventEntity';
import DefaultIntervalPickerState from './DefaultIntervalPickerState';
import S from '../../../core/utilities/Main';
import TotalEarningsEntity from '../../entities/TotalEarningsEntity';

export default class SuperAdminAnalyticsPageStore {

    statisticsRepo: StatisticsRepo;

    defaultIntervalPickerState: DefaultIntervalPickerState;
    totalEarningsEntity: TotalEarningsEntity;

    eventType: NftEventType;
    nftEventFilterModel: NftEventFilterModel;
    nftEventEntities: NftEventEntity[];
    nftEntitiesMap: Map < string, NftEntity >;
    analyticsTableState: TableState;

    constructor(statisticsRepo: StatisticsRepo) {
        this.statisticsRepo = statisticsRepo;

        this.defaultIntervalPickerState = new DefaultIntervalPickerState(this.fetchEarnings);
        this.totalEarningsEntity = null;

        this.eventType = S.NOT_EXISTS;
        this.nftEventFilterModel = new NftEventFilterModel();
        this.nftEventEntities = null;
        this.nftEntitiesMap = new Map();
        this.analyticsTableState = new TableState(0, [], this.fetchNftEvents, 10);

        makeAutoObservable(this);
    }

    async init() {
        await this.fetchEarnings();
        await this.fetchNftEvents();
    }

    fetchEarnings = async () => {
        const defaultIntervalPickerState = this.defaultIntervalPickerState;
        const totalEarningsEntity = await this.statisticsRepo.fetchTotalNftEarnings(defaultIntervalPickerState.earningsTimestampFrom, defaultIntervalPickerState.earningsTimestampTo);

        runInAction(() => {
            this.totalEarningsEntity = totalEarningsEntity;
        })
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

    onChangeTableFilter = (value: number) => {
        this.eventType = value;
    }
}
