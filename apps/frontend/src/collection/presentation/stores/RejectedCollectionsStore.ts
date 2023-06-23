import { makeAutoObservable } from 'mobx';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import TableState from '../../../core/presentation/stores/TableState';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';
import CollectionRepo from '../repos/CollectionRepo';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';

export default class RejectedCollectionsStore {

    collectionRepo: CollectionRepo;
    accountSessionStore: AccountSessionStore;
    alertStore: AlertStore;
    nftRepo: NftRepo;

    collectionsTableState: TableState;

    collectionEntities: CollectionEntity[];
    collectionDetailsMap: Map<string, CollectionDetailsEntity>;

    constructor(collectionRepo: CollectionRepo, nftRepo: NftRepo, accountSessionStore: AccountSessionStore, alertStore: AlertStore) {
        this.collectionRepo = collectionRepo;
        this.accountSessionStore = accountSessionStore;
        this.alertStore = alertStore;
        this.nftRepo = nftRepo;

        this.collectionsTableState = new TableState(0, [], this.fetchCollections, 8);

        this.collectionEntities = null;
        this.collectionDetailsMap = null;

        makeAutoObservable(this);
    }

    async init(itemsPerPage: number) {
        this.collectionsTableState.tableFilterState.from = 0;
        this.collectionsTableState.tableFilterState.itemsPerPage = itemsPerPage;
        await this.fetchCollections();
    }

    async fetchCollections() {
        const collectionFilter = new CollectionFilterModel();
        collectionFilter.from = this.collectionsTableState.tableFilterState.from;
        collectionFilter.count = this.collectionsTableState.tableFilterState.itemsPerPage;
        collectionFilter.status = [CollectionStatus.REJECTED];

        const { collectionEntities, total } = await this.collectionRepo.fetchCollectionsByFilter(collectionFilter);
        if (collectionEntities.length === 0 && collectionFilter.from > 0) {
            this.collectionsTableState.tableFilterState.pageBack();
            this.fetchCollections();
            return;
        }

        const collectionIds = collectionEntities.map((collectionEntity) => {
            return collectionEntity.id;
        });
        const collectionDetails = await this.collectionRepo.fetchCollectionsDetailsByIds(collectionIds);
        const collectionDetailsMap = new Map();
        collectionDetails.forEach((collectionDetailsEntity) => {
            collectionDetailsMap.set(collectionDetailsEntity.collectionId, collectionDetailsEntity);
        });

        await runInActionAsync(() => {
            this.collectionEntities = collectionEntities;
            this.collectionDetailsMap = collectionDetailsMap;
            this.collectionsTableState.tableFilterState.setTotal(total);
        });
    }

    getCollectionDetails(collectionId: string): CollectionDetailsEntity | null {
        return this.collectionDetailsMap.get(collectionId) ?? null;
    }
}
