import { action, makeAutoObservable, runInAction } from 'mobx';
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
    approvedCollectionsTableState: TableState
    collectionFilterModel: CollectionFilterModel;

    inited: boolean;
    miningFarmEntity: MiningFarmEntity;
    miningFarmDetailsEntity: MiningFarmDetailsEntity;
    collectionEntities: CollectionEntity[];
    queuedCollectionEntities: CollectionEntity[];
    approvedCollectionEntities: CollectionEntity[];
    collectionDetailsMap: Map<string, CollectionDetailsEntity>;

    constructor(miningFarmRepo: MiningFarmRepo, collectionRepo: CollectionRepo, nftRepo: NftRepo, accountSessionStore: AccountSessionStore, alertStore: AlertStore, walletStore: WalletStore) {
        this.miningFarmRepo = miningFarmRepo;
        this.collectionRepo = collectionRepo;
        this.nftRepo = nftRepo;
        this.accountSessionStore = accountSessionStore;
        this.alertStore = alertStore;
        this.walletStore = walletStore;

        this.gridViewState = new GridViewState(this.fetchAnyCollections, 3, 4, 6);
        this.queuedCollectionsTableState = new TableState(S.NOT_EXISTS, [], this.fetchQueuedCollections, 5);
        this.approvedCollectionsTableState = new TableState(S.NOT_EXISTS, [], this.fetchApprovedCollections, 5);
        this.collectionFilterModel = new CollectionFilterModel();
        this.collectionFilterModel.markApprovedCollectins();

        this.inited = false;
        this.miningFarmEntity = null;
        this.miningFarmDetailsEntity = null;
        this.collectionEntities = null;
        this.queuedCollectionEntities = null;
        this.approvedCollectionEntities = null;
        this.collectionDetailsMap = new Map<string, CollectionDetailsEntity>();

        makeAutoObservable(this);
    }

    @action
    async init(farmId = S.Strings.NOT_EXISTS) {
        this.inited = false;
        this.miningFarmEntity = null;
        this.miningFarmDetailsEntity = null;
        this.collectionEntities = null;

        let miningFarmEntity;
        if (farmId === S.Strings.NOT_EXISTS) {
            miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId();
        } else {
            miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmById(farmId);
        }

        if (miningFarmEntity !== null) {
            runInAction(async () => {
                this.miningFarmEntity = miningFarmEntity;
                this.collectionFilterModel.farmId = this.miningFarmEntity.id;
                if (this.accountSessionStore.accountEntity?.accountId === this.miningFarmEntity.accountId) {
                    this.collectionFilterModel.markAnyCollectins();
                }

                await this.fetchMiningFarmDetails();
                await this.fetchApprovedCollections();
                await this.fetchAnyCollections();
                await this.fetchQueuedCollections();
            });
        }

        runInAction(() => {
            this.inited = true;
        });
    }

    async fetchMiningFarmDetails() {
        try {
            const miningFarmDetailsEntity = await this.miningFarmRepo.fetchMiningFarmDetailsById(this.miningFarmEntity.id);

            runInAction(() => {
                this.miningFarmDetailsEntity = miningFarmDetailsEntity;
            })
        } catch (e) {
            console.log(e);
        }
    }

    fetchQueuedCollections = async () => {
        if (this.accountSessionStore.isSuperAdmin() === false) {
            runInAction(() => {
                this.queuedCollectionEntities = [];
            })

            return;
        }

        const collectionFilterModel = new CollectionFilterModel();
        collectionFilterModel.status = [CollectionStatus.QUEUED];
        collectionFilterModel.from = this.queuedCollectionsTableState.tableFilterState.from;
        collectionFilterModel.count = this.queuedCollectionsTableState.tableFilterState.itemsPerPage;
        const { collectionEntities, total } = await this.collectionRepo.fetchCollectionsByFilter(collectionFilterModel);
        await this.fetchCollectionDetails(collectionEntities);

        runInAction(() => {
            this.queuedCollectionEntities = collectionEntities;
            this.queuedCollectionsTableState.tableFilterState.total = total;
        });
    }

    fetchApprovedCollections = async () => {
        if (this.accountSessionStore.isSuperAdmin() === false) {
            runInAction(() => {
                this.approvedCollectionEntities = [];
            });

            return;
        }

        const collectionFilterModel = new CollectionFilterModel();
        collectionFilterModel.status = [CollectionStatus.APPROVED];
        collectionFilterModel.from = this.approvedCollectionsTableState.tableFilterState.from;
        collectionFilterModel.count = this.approvedCollectionsTableState.tableFilterState.itemsPerPage;
        const { collectionEntities, total } = await this.collectionRepo.fetchCollectionsByFilter(collectionFilterModel);
        await this.fetchCollectionDetails(collectionEntities);

        runInAction(() => {
            this.approvedCollectionEntities = collectionEntities;
            this.approvedCollectionsTableState.tableFilterState.total = total;
        });
    }

    fetchAnyCollections = async () => {
        if (this.accountSessionStore.isSuperAdmin() === true) {
            runInAction(() => {
                this.collectionEntities = [];
            });
            return;
        }

        this.gridViewState.setIsLoading(true);

        this.collectionFilterModel.from = this.gridViewState.getFrom();
        this.collectionFilterModel.count = this.gridViewState.getItemsPerPage();
        const { collectionEntities, total } = await this.collectionRepo.fetchCollectionsByFilter(this.collectionFilterModel);
        await this.fetchCollectionDetails(collectionEntities);

        runInAction(() => {
            this.collectionEntities = collectionEntities;
            this.gridViewState.setTotalItems(total);
            this.gridViewState.setIsLoading(false);
        });
    }

    private async fetchCollectionDetails(collectionEntities: CollectionEntity[]) {
        const collectionIds = collectionEntities.map((entity) => entity.id);
        const collectionDetails = await this.collectionRepo.fetchCollectionsDetailsByIds(collectionIds);

        runInAction(() => {
            const collectionDetailsMap = this.collectionDetailsMap;
            this.collectionDetailsMap = null;

            collectionDetails.forEach((collectionDetailsEntity) => {
                collectionDetailsMap.set(collectionDetailsEntity.collectionId, collectionDetailsEntity);
            });

            this.collectionDetailsMap = collectionDetailsMap;
        })
    }

    getFloorPrice(collectionId: string): string {
        return this.collectionDetailsMap.get(collectionId)?.formatFloorPriceInCudos() ?? '';
    }

    onChangeSearchWord = action((searchString: string) => {
        this.collectionFilterModel.searchString = searchString;
        this.fetchAnyCollections();
    })

    async onClickApproveCollection(collectionEntity: CollectionEntity) {
        if (this.walletStore.isConnected() === false) {
            this.alertStore.show('You must connect your wallet first');
            return;
        }

        try {
            const clonedCollectionEntity = collectionEntity.clone();
            clonedCollectionEntity.markApproved();

            const signingClient = await this.walletStore.getSigningClient();
            await this.collectionRepo.approveCollection(clonedCollectionEntity, this.accountSessionStore.superAdminEntity, this.walletStore.getAddress(), signingClient);
            await this.fetchQueuedCollections();
            await this.fetchApprovedCollections();
        } catch (e) {
            this.alertStore.show(e.message);
        }
    }

    async onClickRejectCollection(collectionEntity: CollectionEntity) {
        try {
            const collectionClone = collectionEntity.clone();
            collectionClone.markRejected();

            await this.collectionRepo.editCollection(collectionClone);
            await this.fetchQueuedCollections();
            await this.fetchApprovedCollections();
        } catch (e) {
            console.log(e);
        }
    }

    rejectMiningFarm = async () => {
        try {
            const clonedFarm = this.miningFarmEntity.clone();
            clonedFarm.status = MiningFarmStatus.REJECTED;
            await this.miningFarmRepo.creditMiningFarm(clonedFarm);

            runInAction(() => {
                this.miningFarmEntity.status = clonedFarm.status;
            })
        } catch (e) {
            console.log(e);
        }
    }

    approveMiningFarm = async () => {
        try {
            const clonedFarm = this.miningFarmEntity.clone();
            clonedFarm.status = MiningFarmStatus.APPROVED;
            await this.miningFarmRepo.creditMiningFarm(clonedFarm);

            runInAction(() => {
                this.miningFarmEntity.status = clonedFarm.status;
            });
        } catch (e) {
            console.log(e);
        }
    }
}
