import { makeAutoObservable, runInAction } from 'mobx';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';
import MiningFarmRepo from '../repos/MiningFarmRepo';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import TableState from '../../../../core/presentation/stores/TableState';
import CollectionFilterModel, { CollectionOrderBy } from '../../utilities/CollectionFilterModel';
import CollectionRepo from '../repos/CollectionRepo';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionEntity from '../../entities/CollectionEntity';

export default class SuperAdminCollectionsPageStore {

    collectionsRepo: CollectionRepo;

    collectionFilterModel: CollectionFilterModel;

    tableState: TableState
    collectionEntities: CollectionEntity[];
    collectionDetailsMap: Map<string, CollectionDetailsEntity>;

    constructor(collectionsRepo: CollectionRepo) {
        this.collectionsRepo = collectionsRepo;

        this.collectionFilterModel = null;

        this.collectionEntities = null;
        this.collectionDetailsMap = null;

        makeAutoObservable(this);
    }

    async init() {
        this.collectionFilterModel = new CollectionFilterModel();
        this.collectionEntities = null;
        this.collectionDetailsMap = new Map<string, CollectionDetailsEntity>();

        await this.fetchTopCollections();
    }

    fetchTopCollections = async () => {

        this.collectionFilterModel.orderBy = CollectionOrderBy.TOP_DESC;
        this.collectionFilterModel.from = 0
        this.collectionFilterModel.count = 12

        const { collectionEntities } = await this.collectionsRepo.fetchCollectionsByFilter(this.collectionFilterModel)
        const collectionDetailsEntities = await this.collectionsRepo.fetchCollectionsDetailsByIds(collectionEntities.map((collectionEntity) => collectionEntity.id));

        runInAction(() => {
            this.collectionEntities = collectionEntities;
            collectionDetailsEntities.forEach((collectionDetailsEntity) => {
                this.collectionDetailsMap.set(collectionDetailsEntity.collectionId, collectionDetailsEntity);
            })
        });
    }

    onChangeSearchWord = (value) => {
        this.collectionFilterModel.searchString = value;
        this.fetchTopCollections();
    }

}
