import { makeAutoObservable, runInAction } from 'mobx';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';
import MiningFarmRepo from '../repos/MiningFarmRepo';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import TableState from '../../../../core/presentation/stores/TableState';
import S from '../../../../core/utilities/Main';

export default class SuperAdminMningFarmsPageStore {

    miningFarmRepo: MiningFarmRepo;

    miningFarmFilterModel: MiningFarmFilterModel;

    tableState: TableState
    miningFarmEntities: MiningFarmEntity[];
    topPerformingFarmsDetailsMap: Map<string, MiningFarmDetailsEntity>;

    constructor(miningFarmRepo: MiningFarmRepo) {
        this.miningFarmRepo = miningFarmRepo;

        this.tableState = new TableState(S.NOT_EXISTS, [], this.fetchMiningFarms, 10);
        this.miningFarmFilterModel = new MiningFarmFilterModel();

        this.miningFarmEntities = null;
        this.topPerformingFarmsDetailsMap = null;

        makeAutoObservable(this);
    }

    async init() {
        this.miningFarmFilterModel = new MiningFarmFilterModel();
        await this.fetchMiningFarms();
    }

    fetchMiningFarms = async () => {
        this.miningFarmFilterModel.from = this.tableState.tableFilterState.from;
        this.miningFarmFilterModel.count = this.tableState.tableFilterState.itemsPerPage;

        const { miningFarmEntities, total } = await this.miningFarmRepo.fetchMiningFarmsByFilter(this.miningFarmFilterModel)
        const miningFarmDetailsEntities = await this.miningFarmRepo.fetchMiningFarmsDetailsByIds(miningFarmEntities.map((miningFarmEntity) => miningFarmEntity.id));
        const topPerformingFarmsDetailsMap = new Map();
        miningFarmDetailsEntities.forEach((entity) => {
            topPerformingFarmsDetailsMap.set(entity.miningFarmId, entity);
        })

        runInAction(() => {
            this.miningFarmEntities = miningFarmEntities;
            this.topPerformingFarmsDetailsMap = topPerformingFarmsDetailsMap;
            this.tableState.tableFilterState.total = total;
        });
    }

    onChangeSearchWord = (value) => {
        this.miningFarmFilterModel.searchString = value;
        this.fetchMiningFarms();
    }

    getMiningFarmDetails(id: string): MiningFarmDetailsEntity {
        return this.topPerformingFarmsDetailsMap.get(id) ?? null;
    }

}
