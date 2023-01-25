import GridViewState from '../../../core/presentation/stores/GridViewState';
import { makeAutoObservable, runInAction } from 'mobx';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';
import MiningFarmRepo from '../repos/MiningFarmRepo';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';

export default class ExploreMiningFarmsPageStore {

    miningFarmRepo: MiningFarmRepo;

    gridViewState: GridViewState;
    miningFarmFilterModel: MiningFarmFilterModel;

    miningFarmEntities: MiningFarmEntity[];
    miningFarmDetailsEntities: MiningFarmDetailsEntity[];

    constructor(miningFarmRepo: MiningFarmRepo) {
        this.miningFarmRepo = miningFarmRepo;

        this.gridViewState = new GridViewState(this.fetch, 3, 4, 6);
        this.miningFarmFilterModel = new MiningFarmFilterModel();
        this.miningFarmFilterModel.markApprovedMiningFarms();

        this.miningFarmEntities = [];
        this.miningFarmDetailsEntities = [];

        makeAutoObservable(this);
    }

    async init() {
        await this.fetch();
    }

    fetch = async () => {
        this.gridViewState.setIsLoading(true);
        const miningFarmFilterModel = this.miningFarmFilterModel.clone();
        miningFarmFilterModel.from = this.gridViewState.getFrom();
        miningFarmFilterModel.count = this.gridViewState.getItemsPerPage();

        const { miningFarmEntities, total } = await this.miningFarmRepo.fetchMiningFarmsByFilter(miningFarmFilterModel)
        const miningFarmDetailsEntities = await this.miningFarmRepo.fetchMiningFarmsDetailsByIds(miningFarmEntities.map((miningFarmEntity) => miningFarmEntity.id));

        await runInActionAsync(() => {
            this.miningFarmFilterModel.from = this.gridViewState.getFrom();
            this.miningFarmFilterModel.count = this.gridViewState.getItemsPerPage();
            this.miningFarmEntities = miningFarmEntities;
            this.miningFarmDetailsEntities = miningFarmDetailsEntities;
            this.gridViewState.setTotalItems(total);
            this.gridViewState.setIsLoading(false);
        });
    }

    onChangeSearchWord = async (value) => {
        this.miningFarmFilterModel.searchString = value;
        await this.fetch();
    }

}
