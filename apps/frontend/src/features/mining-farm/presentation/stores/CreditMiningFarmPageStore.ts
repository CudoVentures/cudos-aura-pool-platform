import { makeAutoObservable, runInAction } from 'mobx';
import CollectionEntity, { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import MiningFarmRepo from '../repos/MiningFarmRepo';
import CollectionFilterModel from '../../../collection/utilities/CollectionFilterModel';
import GridViewState from '../../../../core/presentation/stores/GridViewState';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import S from '../../../../core/utilities/Main';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import TableState from '../../../../core/presentation/stores/TableState';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import CollectionDetailsEntity from '../../../collection/entities/CollectionDetailsEntity';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import NftFilterEntity from '../../../../../../backend/src/nft/entities/nft-filter.entity';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';

export default class CreditMiningFarmPageStore {

    miningFarmRepo: MiningFarmRepo;
    collectionRepo: CollectionRepo;
    nftRepo: NftRepo;
    accountSessionStore: AccountSessionStore;
    alertStore: AlertStore;
    walletStore: WalletStore;

    gridViewState: GridViewState;
    queuedCollectionsTableState: TableState
    collectionFilterModel: CollectionFilterModel;

    inited: boolean;
    miningFarmEntity: MiningFarmEntity;
    miningFarmDetailsEntity: MiningFarmDetailsEntity;
    collectionEntities: CollectionEntity[];
    queuedCollectionEntities: CollectionEntity[];
    collectionDetailsMap: Map<string, CollectionDetailsEntity>;

    constructor(miningFarmRepo: MiningFarmRepo, collectionRepo: CollectionRepo, nftRepo: NftRepo, accountSessionStore: AccountSessionStore, alertStore: AlertStore, walletStore: WalletStore) {
        this.miningFarmRepo = miningFarmRepo;
        this.collectionRepo = collectionRepo;
        this.nftRepo = nftRepo;
        this.accountSessionStore = accountSessionStore;
        this.alertStore = alertStore;
        this.walletStore = walletStore;

        this.gridViewState = new GridViewState(this.fetchCollections, 3, 4, 6);
        this.queuedCollectionsTableState = new TableState(S.NOT_EXISTS, [], this.fetchQueuedCollections, 5);
        this.collectionFilterModel = new CollectionFilterModel();
        this.collectionFilterModel.markAnyCollectins();

        this.inited = false;
        this.miningFarmEntity = null;
        this.miningFarmDetailsEntity = null;
        this.collectionEntities = null;
        this.queuedCollectionEntities = null;
        this.collectionDetailsMap = new Map<string, CollectionDetailsEntity>();

        makeAutoObservable(this);
    }

    async init(farmId = S.Strings.NOT_EXISTS) {
        this.inited = false;
        this.miningFarmEntity = null;
        this.miningFarmDetailsEntity = null;
        this.collectionEntities = null;

        if (farmId === S.Strings.NOT_EXISTS) {
            this.miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId();
        } else {
            this.miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmById(farmId);
        }

        if (this.miningFarmEntity !== null) {
            this.collectionFilterModel.farmId = this.miningFarmEntity.id;
            await this.fetchMiningFarmDetails();
            await this.fetchCollections();
            await this.fetchQueuedCollections();
        }
        this.inited = true;
    }

    async fetchMiningFarmDetails() {
        try {
            this.miningFarmDetailsEntity = await this.miningFarmRepo.fetchMiningFarmDetailsById(this.miningFarmEntity.id);
        } catch (e) {
            console.log(e);
        }
    }

    fetchQueuedCollections = async () => {
        if (!this.accountSessionStore.isSuperAdmin()) {
            this.queuedCollectionEntities = [];
            return;
        }

        const collectionFilterModel = new CollectionFilterModel();
        collectionFilterModel.status = [CollectionStatus.QUEUED];
        collectionFilterModel.from = this.queuedCollectionsTableState.tableFilterState.from;
        collectionFilterModel.count = this.queuedCollectionsTableState.tableFilterState.itemsPerPage;
        const { collectionEntities, total } = await this.collectionRepo.fetchCollectionsByFilter(collectionFilterModel);

        runInAction(() => {
            this.queuedCollectionEntities = collectionEntities;
            this.queuedCollectionsTableState.tableFilterState.total = total;
        });
    }

    fetchCollections = async () => {
        this.gridViewState.setIsLoading(true);

        this.collectionFilterModel.status = [CollectionStatus.APPROVED];
        this.collectionFilterModel.from = this.gridViewState.getFrom();
        this.collectionFilterModel.count = this.gridViewState.getItemsPerPage();
        const { collectionEntities, total } = await this.collectionRepo.fetchCollectionsByFilter(this.collectionFilterModel);

        runInAction(() => {
            this.collectionEntities = collectionEntities;
            this.gridViewState.setTotalItems(total);
            this.gridViewState.setIsLoading(false);
        });

    }

    async fetchCollectionDetails() {
        const activeCollectionIds = this.collectionEntities.map((entity) => entity.id);
        const queuedCollectionIds = this.collectionEntities.map((entity) => entity.id);
        const allIds = activeCollectionIds.concat(queuedCollectionIds);
        const collectionDetails = await this.collectionRepo.fetchCollectionsDetailsByIds(allIds);

        collectionDetails.forEach((collectionDetailsEntity) => {
            this.collectionDetailsMap.set(collectionDetailsEntity.collectionId, collectionDetailsEntity);
        })
    }

    getFloorPrice(collectionId: string): string {
        const collectionDetails = this.collectionDetailsMap.get(collectionId);
        if (!collectionDetails) {
            return '';
        }
        return collectionDetails.formatFloorPriceInCudos();
    }

    onChangeSearchWord = (searchString: string) => {
        this.collectionFilterModel.searchString = searchString;
        this.fetchCollections();
    }

    async onClickApproveCollection(collectionEntity: CollectionEntity) {
        if (this.walletStore.isConnected() === false) {
            this.alertStore.show('You must connect your wallet first');
            return;
        }

        try {
            collectionEntity.markApproved();
            await this.collectionRepo.approveCollection(collectionEntity, this.accountSessionStore.superAdminEntity, this.walletStore.ledger);
            await this.fetchCollections();
        } catch (e) {
            this.alertStore.show(e.message);
        }
    }

    async onClickRejectCollection(collectionEntity: CollectionEntity) {
        try {
            const collectionClone = collectionEntity.clone();

            collectionClone.markRejected();
            const nftFilter = new NftFilterEntity();
            nftFilter.collectionIds = [collectionClone.id];

            const { nftEntities } = await this.nftRepo.fetchNftsByFilter(nftFilter);
            await this.collectionRepo.creditCollection(collectionClone, nftEntities);
            await this.fetchQueuedCollections();
        } catch (e) {
            console.log(e);
        }
    }

    rejectMiningFarm = async () => {
        try {
            const clonedFarm = this.miningFarmEntity.clone();
            clonedFarm.status = MiningFarmStatus.REJECTED;
            await this.miningFarmRepo.creditMiningFarm(clonedFarm);
            this.miningFarmEntity.status = clonedFarm.status
        } catch (e) {
            console.log(e);
        }
    }

    approveMiningFarm = async () => {
        try {
            const clonedFarm = this.miningFarmEntity.clone();
            clonedFarm.status = MiningFarmStatus.APPROVED;
            await this.miningFarmRepo.creditMiningFarm(clonedFarm);
            this.miningFarmEntity.status = clonedFarm.status
        } catch (e) {
            console.log(e);
        }
    }
}
