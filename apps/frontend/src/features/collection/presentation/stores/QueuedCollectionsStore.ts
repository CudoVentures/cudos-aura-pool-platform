import { action, makeAutoObservable, runInAction } from 'mobx';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import TableState from '../../../../core/presentation/stores/TableState';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import MiningFarmFilterModel from '../../../mining-farm/utilities/MiningFarmFilterModel';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionFilterModel from '../../utilities/CollectionFilterModel';
import CollectionRepo from '../repos/CollectionRepo';

export default class QueuedCollectionsStore {

    collectionRepo: CollectionRepo;
    miningFarmRepo: MiningFarmRepo;
    walletStore: WalletStore;
    accountSessionStore: AccountSessionStore;
    alertStore: AlertStore;
    nftRepo: NftRepo;

    collectionsTableState: TableState;

    farmEntitiesMap: Map<string, MiningFarmEntity>;
    collectionEntities: CollectionEntity[];
    collectionDetailsMap: Map < string, CollectionDetailsEntity >;

    constructor(collectionRepo: CollectionRepo, miningFarmRepo: MiningFarmRepo, nftRepo: NftRepo, walletStore: WalletStore, accountSessionStore: AccountSessionStore, alertStore: AlertStore) {
        this.collectionRepo = collectionRepo;
        this.miningFarmRepo = miningFarmRepo;
        this.walletStore = walletStore;
        this.accountSessionStore = accountSessionStore;
        this.alertStore = alertStore;
        this.nftRepo = nftRepo;

        this.collectionsTableState = new TableState(0, [], this.fetchCollections, 8);

        this.farmEntitiesMap = new Map<string, MiningFarmEntity>();
        this.collectionEntities = null;
        this.collectionDetailsMap = null;

        makeAutoObservable(this);
    }

    @action
    async init(itemsPerPage: number) {
        this.collectionsTableState.tableFilterState.from = 0;
        this.collectionsTableState.tableFilterState.itemsPerPage = itemsPerPage;
        this.farmEntitiesMap = new Map<string, MiningFarmEntity>();
        await this.fetchCollections();
        this.fetchMiningFarms();
    }

    async fetchCollections() {
        const collectionFilter = new CollectionFilterModel();
        collectionFilter.from = this.collectionsTableState.tableFilterState.from;
        collectionFilter.count = this.collectionsTableState.tableFilterState.itemsPerPage;
        collectionFilter.status = [CollectionStatus.QUEUED];

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

    async fetchMiningFarms() {
        const miningFarmEntities = await this.miningFarmRepo.fetchMiningFarmsByIds(this.collectionEntities.map((entity) => entity.farmId));

        runInAction(() => {
            const cache = this.farmEntitiesMap;
            this.farmEntitiesMap = null;

            miningFarmEntities.forEach((miningFarmEntity) => {
                cache.set(miningFarmEntity.id, miningFarmEntity);
            })

            this.farmEntitiesMap = cache;
        })
    }

    getCollectionDetails(collectionId: string): CollectionDetailsEntity | null {
        return this.collectionDetailsMap.get(collectionId) ?? null;
    }

    async approveCollection(collectionEntity: CollectionEntity) {
        if (this.walletStore.isConnected() === false) {
            this.alertStore.show('You must connect your wallet first');
            return;
        }

        const clonedCollectionEntity = collectionEntity.clone();
        clonedCollectionEntity.markApproved();

        try {
            await this.collectionRepo.approveCollection(clonedCollectionEntity, this.accountSessionStore.superAdminEntity, this.walletStore.ledger);
            collectionEntity.markApproved();
        } catch (e) {
            this.alertStore.show(e.message);
        }
    }

    async rejectCollection(collectionEntity: CollectionEntity) {
        try {
            const collectionClone = collectionEntity.clone();

            collectionClone.markRejected();
            const nftFilter = new NftFilterModel();
            nftFilter.collectionIds = [collectionClone.id];

            const { nftEntities } = await this.nftRepo.fetchNftsByFilter(nftFilter);
            await this.collectionRepo.creditCollection(collectionClone, nftEntities);
            collectionEntity.markRejected();
        } catch (e) {
            console.log(e);
        }
    }
}
