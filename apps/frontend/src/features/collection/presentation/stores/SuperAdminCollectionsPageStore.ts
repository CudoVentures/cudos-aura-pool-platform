import { makeAutoObservable, runInAction } from 'mobx';
import TableState from '../../../../core/presentation/stores/TableState';
import CollectionFilterModel, { CollectionOrderBy } from '../../utilities/CollectionFilterModel';
import CollectionRepo from '../repos/CollectionRepo';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionEntity from '../../entities/CollectionEntity';

export enum SuperAdminCollectionsTableType {
    APPROVED = 1,
    QUEUED = 2,
    REJECTED = 3,
}

export default class SuperAdminCollectionsPageStore {

    collectionsRepo: CollectionRepo;

    collectionFilterModel: CollectionFilterModel;

    tableState: TableState
    collectionEntities: CollectionEntity[];
    collectionDetailsMap: Map<string, CollectionDetailsEntity>;
    selectedTableType: SuperAdminCollectionsTableType;

    constructor(collectionsRepo: CollectionRepo) {
        this.collectionsRepo = collectionsRepo;

        this.collectionFilterModel = null;

        this.collectionEntities = null;
        this.collectionDetailsMap = null;
        this.selectedTableType = SuperAdminCollectionsTableType.APPROVED;

        makeAutoObservable(this);
    }

    async init() {
        this.collectionFilterModel = new CollectionFilterModel();
        this.collectionEntities = null;
        this.collectionDetailsMap = new Map<string, CollectionDetailsEntity>();
        this.selectedTableType = SuperAdminCollectionsTableType.APPROVED;

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

    onClickShowApproved = () => {
        this.selectedTableType = SuperAdminCollectionsTableType.APPROVED;
    }

    onClickShowQueued = () => {
        this.selectedTableType = SuperAdminCollectionsTableType.QUEUED;
    }

    onClickShowRejected = () => {
        this.selectedTableType = SuperAdminCollectionsTableType.REJECTED;
    }

    isSelectedTableApproved() {
        return this.selectedTableType === SuperAdminCollectionsTableType.APPROVED;
    }

    isSelectedTableQueued() {
        return this.selectedTableType === SuperAdminCollectionsTableType.QUEUED;
    }

    isSelectedTableRejected() {
        return this.selectedTableType === SuperAdminCollectionsTableType.REJECTED;
    }
}
