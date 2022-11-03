import GridViewState from '../../../../core/presentation/stores/GridViewState';
import { makeAutoObservable, runInAction } from 'mobx';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';
import MiningFarmRepo from '../repos/MiningFarmRepo';

export default class ExploreMiningFarmsPageStore {

    miningFarmRepo: MiningFarmRepo;

    gridViewState: GridViewState;
    miningFarmFilterModel: MiningFarmFilterModel;

    miningFarmEntities: MiningFarmEntity[];

    constructor(miningFarmRepo: MiningFarmRepo) {
        this.miningFarmRepo = miningFarmRepo;

        this.gridViewState = new GridViewState(this.fetch, 3, 4, 6);
        this.miningFarmFilterModel = new MiningFarmFilterModel();

        this.miningFarmEntities = [];

        makeAutoObservable(this);
    }

    async init() {
        await this.fetch();
    }

    fetch = async () => {
        this.gridViewState.setIsLoading(true);

        this.miningFarmFilterModel.from = this.gridViewState.getFrom();
        this.miningFarmFilterModel.count = this.gridViewState.getItemsPerPage();

        const { miningFarmEntities, total } = await this.miningFarmRepo.fetchMiningFarmsByFilter(this.miningFarmFilterModel)

        runInAction(() => {
            this.miningFarmEntities = miningFarmEntities;
            this.gridViewState.setTotalItems(total);
            this.gridViewState.setIsLoading(false);
        });
    }

    onChangeSearchWord = (value) => {
        this.miningFarmFilterModel.searchString = value;
        this.fetch();
    }

}
