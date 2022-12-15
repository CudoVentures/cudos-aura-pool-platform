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
    miningFarmDetailsEntities: MiningFarmDetailsEntity[];

    constructor(miningFarmRepo: MiningFarmRepo) {
        this.miningFarmRepo = miningFarmRepo;

        this.tableState = new TableState(S.NOT_EXISTS, [], this.fetchMiningFarms, 10);
        this.miningFarmFilterModel = new MiningFarmFilterModel();

        this.miningFarmEntities = null;
        this.miningFarmDetailsEntities = null;

        makeAutoObservable(this);
    }

    async init() {
        this.miningFarmFilterModel = new MiningFarmFilterModel();
        this.miningFarmEntities = null;
        this.miningFarmDetailsEntities = null;
        await this.fetchMiningFarms();
    }

    fetchMiningFarms = async () => {

        this.miningFarmFilterModel.from = this.tableState.tableFilterState.from;
        this.miningFarmFilterModel.count = this.tableState.tableFilterState.itemsPerPage;

        const { miningFarmEntities, total } = await this.miningFarmRepo.fetchMiningFarmsByFilter(this.miningFarmFilterModel)
        const miningFarmDetailsEntities = await this.miningFarmRepo.fetchMiningFarmsDetailsByIds(miningFarmEntities.map((miningFarmEntity) => miningFarmEntity.id));

        runInAction(() => {
            this.miningFarmEntities = miningFarmEntities;
            this.miningFarmDetailsEntities = miningFarmDetailsEntities;
            this.tableState.tableFilterState.total = total;
        });
    }

    onChangeSearchWord = (value) => {
        this.miningFarmFilterModel.searchString = value;
        this.fetchMiningFarms();
    }

}
