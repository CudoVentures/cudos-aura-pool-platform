import GridViewState from '../../../core/presentation/stores/GridViewState';
import { action, makeAutoObservable, runInAction } from 'mobx';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import CollectionEntity from '../../entities/CollectionEntity';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';
import CollectionRepo from '../repos/CollectionRepo';

export default class ExploreCollectionsPageStore {

    collectionRepo: CollectionRepo;
    miningFarmRepo: MiningFarmRepo;

    gridViewState: GridViewState;
    collectionFilterModel: CollectionFilterModel;

    collectionEntities: CollectionEntity[];
    miningFarmEntitiesMap: Map < string, MiningFarmEntity >;

    constructor(collectionRepo: CollectionRepo, miningFarmRepo: MiningFarmRepo) {
        this.collectionRepo = collectionRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.gridViewState = new GridViewState(this.fetch, 3, 4, 6);
        this.collectionFilterModel = new CollectionFilterModel();

        this.collectionEntities = null;
        this.miningFarmEntitiesMap = new Map();

        makeAutoObservable(this);
    }

    async init() {
        await this.fetch();
    }

    fetch = async () => {
        this.gridViewState.setIsLoading(true);

        const collectionFilterModel = new CollectionFilterModel();
        Object.assign(collectionFilterModel, this.collectionFilterModel);

        collectionFilterModel.from = this.gridViewState.getFrom();
        collectionFilterModel.count = this.gridViewState.getItemsPerPage();

        const { collectionEntities, total } = await this.collectionRepo.fetchCollectionsByFilter(collectionFilterModel);
        const miningFarmEntities = await this.miningFarmRepo.fetchMiningFarmsByIds(collectionEntities.map((collectionEntity) => {
            return collectionEntity.farmId;
        }));

        const miningFarmEntitiesMap = new Map();
        miningFarmEntities.forEach((miningFarmEntity) => {
            miningFarmEntitiesMap.set(miningFarmEntity.id, miningFarmEntity);
        });

        runInAction(() => {
            this.miningFarmEntitiesMap = miningFarmEntitiesMap;
            this.collectionEntities = collectionEntities;
            this.gridViewState.setTotalItems(total);
            this.gridViewState.setIsLoading(false);
        });
    }

    getMiningFarmName(miningFarmId: string): string {
        return this.miningFarmEntitiesMap.get(miningFarmId)?.name ?? '';
    }

    onChangeSearchWord = action((value) => {
        this.collectionFilterModel.searchString = value;
        this.fetch();
    })

}
