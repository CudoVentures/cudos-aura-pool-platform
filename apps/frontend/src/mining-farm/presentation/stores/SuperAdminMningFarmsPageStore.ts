import { action, makeAutoObservable, runInAction } from 'mobx';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';
import MiningFarmRepo from '../repos/MiningFarmRepo';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import TableState from '../../../core/presentation/stores/TableState';
import S from '../../../core/utilities/Main';
import StatisticsRepo from '../../../analytics/presentation/repos/StatisticsRepo';
import MiningFarmEarningsEntity from '../../../analytics/entities/MiningFarmEarningsEntity';

export default class SuperAdminMningFarmsPageStore {

    miningFarmRepo: MiningFarmRepo;
    statisticsRepo: StatisticsRepo;

    miningFarmFilterModel: MiningFarmFilterModel;

    tableState: TableState
    miningFarmEntities: MiningFarmEntity[];
    topPerformingFarmsEarningsMap: Map<string, MiningFarmEarningsEntity>;

    constructor(miningFarmRepo: MiningFarmRepo, statisticsRepo: StatisticsRepo) {
        this.miningFarmRepo = miningFarmRepo;
        this.statisticsRepo = statisticsRepo;

        this.tableState = new TableState(S.NOT_EXISTS, [], this.fetchMiningFarms, 10);
        this.miningFarmFilterModel = new MiningFarmFilterModel();

        this.miningFarmEntities = null;
        this.topPerformingFarmsEarningsMap = null;

        makeAutoObservable(this);
    }

    @action
    async init() {
        this.miningFarmFilterModel = new MiningFarmFilterModel();
        await this.fetchMiningFarms();
    }

    fetchMiningFarms = async () => {
        const miningFarmFilterModel = this.miningFarmFilterModel.clone();
        miningFarmFilterModel.from = this.tableState.tableFilterState.from;
        miningFarmFilterModel.count = this.tableState.tableFilterState.itemsPerPage;

        const { miningFarmEntities, total } = await this.miningFarmRepo.fetchMiningFarmsByFilter(miningFarmFilterModel)
        // const miningFarmDetailsEntities = await this.statisticsRepo.fetchNftEarningsByMiningFarmId(this.miningFarmEntities.map((miningFarmEntity) => miningFarmEntity.id));
        const topPerformingFarmsEarningsMap = new Map();
        // miningFarmDetailsEntities.forEach((entity) => {
        //     topPerformingFarmsEarningsMap.set(entity.miningFarmId, entity);
        // })

        runInAction(() => {
            this.miningFarmFilterModel.from = this.tableState.tableFilterState.from;
            this.miningFarmFilterModel.count = this.tableState.tableFilterState.itemsPerPage;
            this.miningFarmEntities = miningFarmEntities;
            this.topPerformingFarmsEarningsMap = topPerformingFarmsEarningsMap;
            this.tableState.tableFilterState.total = total;
        });
    }

    onChangeSearchWord = action((value) => {
        this.miningFarmFilterModel.searchString = value;
        this.fetchMiningFarms();
    })

    getMiningFarmDetails(id: string): MiningFarmDetailsEntity {
        return this.topPerformingFarmsDetailsMap.get(id) ?? null;
    }

}
