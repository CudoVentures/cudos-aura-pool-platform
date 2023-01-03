import { makeAutoObservable, runInAction } from 'mobx';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import TableState from '../../../../core/presentation/stores/TableState';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';
import CollectionRepo from '../repos/CollectionRepo';

export default class ApprovedCollectionsStore {

    collectionRepo: CollectionRepo;
    walletStore: WalletStore;
    accountSessionStore: AccountSessionStore;
    alertStore: AlertStore;
    nftRepo: NftRepo;

    collectionsTableState: TableState;

    collectionEntities: CollectionEntity[];
    collectionDetailsMap: Map<string, CollectionDetailsEntity>;

    constructor(collectionRepo: CollectionRepo, nftRepo: NftRepo, walletStore: WalletStore, accountSessionStore: AccountSessionStore, alertStore: AlertStore) {
        this.collectionRepo = collectionRepo;
        this.walletStore = walletStore;
        this.accountSessionStore = accountSessionStore;
        this.alertStore = alertStore;
        this.nftRepo = nftRepo;

        this.collectionsTableState = new TableState(0, [], this.fetchCollections, 8);

        this.collectionEntities = null;
        this.collectionDetailsMap = null;

        makeAutoObservable(this);
    }

    init(itemsPerPage: number) {
        this.collectionsTableState.tableFilterState.from = 0;
        this.collectionsTableState.tableFilterState.itemsPerPage = itemsPerPage;
        this.fetchCollections();
    }

    async fetchCollections() {
        const collectionFilter = new CollectionFilterModel();
        collectionFilter.from = this.collectionsTableState.tableFilterState.from;
        collectionFilter.count = this.collectionsTableState.tableFilterState.itemsPerPage;
        collectionFilter.status = [CollectionStatus.APPROVED];

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

        runInAction(() => {
            this.collectionEntities = collectionEntities;
            this.collectionDetailsMap = collectionDetailsMap;
            this.collectionsTableState.tableFilterState.total = total;
        });
    }

    getCollectionDetails(collectionId: string): CollectionDetailsEntity | null {
        return this.collectionDetailsMap.get(collectionId) ?? null;
    }

    // async deleteCollection(collectionEntity: CollectionEntity) {
    //     try {
    //         const collectionClone = collectionEntity.clone();

    //         collectionClone.markRejected();
    //         await this.collectionRepo.editCollection(collectionClone);
    //         collectionEntity.markRejected();
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
}
