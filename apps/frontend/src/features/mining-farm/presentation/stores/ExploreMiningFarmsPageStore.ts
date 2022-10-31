import GridViewState from '../../../../core/presentation/stores/GridViewState';
import { makeAutoObservable, runInAction } from 'mobx';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel, { MiningFarmHashPowerFilter, MiningFarmPriceSortDirection } from '../../utilities/MiningFarmFilterModel';
import MiningFarmApiRepo from '../../data/repo/MiningFarmApiRepo';

export default class ExploreMiningFarmsPageStore {

    miningFarmRepo: MiningFarmApiRepo;

    gridViewState: GridViewState;
    miningFarmFilterModel: MiningFarmFilterModel;

    miningFarmEntities: MiningFarmEntity[];

    constructor(miningFarmRepo: MiningFarmApiRepo) {
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

    onChangeSortKey = (sortKey: number) => {
        this.miningFarmFilterModel.sortKey = sortKey;
        this.fetch();
    }

    onChangeHashPowerFilter = (hashPowerFilter: MiningFarmHashPowerFilter) => {
        this.miningFarmFilterModel.hashPowerFilter = hashPowerFilter;
        this.fetch();
    }

    onChangeSortPriceDirection = (priceSortDirection: MiningFarmPriceSortDirection) => {
        this.miningFarmFilterModel.sortPriceDirection = priceSortDirection;
        this.fetch();
    }
}
