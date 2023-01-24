import { action, makeAutoObservable, runInAction } from 'mobx';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';
import MiningFarmRepo from '../repos/MiningFarmRepo';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import TableState from '../../../core/presentation/stores/TableState';
import S from '../../../core/utilities/Main';
import StatisticsRepo from '../../../analytics/presentation/repos/StatisticsRepo';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';

export default class SuperAdminMningFarmsPageStore {

    miningFarmRepo: MiningFarmRepo;
    statisticsRepo: StatisticsRepo;

    miningFarmFilterModel: MiningFarmFilterModel;

    tableState: TableState
    miningFarmEntities: MiningFarmEntity[];
    miningFarmDetailEntitiesMap: Map<string, MiningFarmDetailsEntity>;

    constructor(miningFarmRepo: MiningFarmRepo, statisticsRepo: StatisticsRepo) {
        this.miningFarmRepo = miningFarmRepo;
        this.statisticsRepo = statisticsRepo;

        this.tableState = new TableState(S.NOT_EXISTS, [], this.fetchMiningFarms, 10);
        this.miningFarmFilterModel = new MiningFarmFilterModel();

        this.miningFarmEntities = null;
        this.miningFarmDetailEntitiesMap = null;

        makeAutoObservable(this);
    }

    async init() {
        this.miningFarmFilterModel = new MiningFarmFilterModel();
        await this.fetchMiningFarms();
    }

    fetchMiningFarms = async () => {
        const miningFarmFilterModel = this.miningFarmFilterModel.clone();
        miningFarmFilterModel.from = this.tableState.tableFilterState.from;
        miningFarmFilterModel.count = this.tableState.tableFilterState.itemsPerPage;

        const { miningFarmEntities, total } = await this.miningFarmRepo.fetchMiningFarmsByFilter(miningFarmFilterModel)
        const miningFarmDetailsEntities = await this.miningFarmRepo.fetchMiningFarmsDetailsByIds(miningFarmEntities.map((miningFarmEntity) => miningFarmEntity.id));
        const miningFarmDetailEntitiesMap = new Map();
        miningFarmDetailsEntities.forEach((entity) => {
            miningFarmDetailEntitiesMap.set(entity.miningFarmId, entity);
        })

        await runInActionAsync(() => {
            this.miningFarmFilterModel.from = this.tableState.tableFilterState.from;
            this.miningFarmFilterModel.count = this.tableState.tableFilterState.itemsPerPage;
            this.miningFarmEntities = miningFarmEntities;
            this.miningFarmDetailEntitiesMap = miningFarmDetailEntitiesMap;
            this.tableState.tableFilterState.total = total;
        });
    }

    onChangeSearchWord = async (value) => {
        this.miningFarmFilterModel.searchString = value;
        await this.fetchMiningFarms();
    }

    getMiningFarmDetails(id: string): MiningFarmDetailsEntity {
        return this.miningFarmDetailEntitiesMap.get(id) ?? null;
    }

}
