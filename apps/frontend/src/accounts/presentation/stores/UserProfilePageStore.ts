import { action, makeAutoObservable } from 'mobx';
import GridViewState from '../../../core/presentation/stores/GridViewState';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import S from '../../../core/utilities/Main';
import NftEntity from '../../../nft/entities/NftEntity';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import StatisticsRepo from '../../../analytics/presentation/repos/StatisticsRepo';
import TableState from '../../../core/presentation/stores/TableState';
import NftEventFilterModel from '../../../analytics/entities/NftEventFilterModel';
import NftEventEntity from '../../../analytics/entities/NftEventEntity';
import UserEarningsEntity from '../../../analytics/entities/UserEarningsEntity';
import DefaultIntervalPickerState from '../../../analytics/presentation/stores/DefaultIntervalPickerState';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import PurchaseTransactionEntity from '../../../nft/entities/PurchaseTransactionEntity';
import PurchaseTransactionsFilterModel from '../../../nft/entities/PurchaseTransactionsFilterModel';
import AccountRepo from '../repos/AccountRepo';

export enum ProfilePages {
    NFTS = 1,
    EARNINGS = 2,
    HISTORY = 3,
    PURCHASES = 4,
}

export default class UserProfilePageStore {

    walletStore: WalletStore;
    nftRepo: NftRepo;
    collectionRepo: CollectionRepo;
    statisticsRepo: StatisticsRepo;

    profilePage: number;
    gridViewState: GridViewState;
    nftFilterModel: NftFilterModel;

    // my nfts tab
    nftEntities: NftEntity[];
    collectionEntitiesMap: Map < string, CollectionEntity >;

    // earnings tab
    defaultIntervalPickerState: DefaultIntervalPickerState;
    userEarningsEntity: UserEarningsEntity;

    // history tab
    nftEventFilterModel: NftEventFilterModel;
    nftEventEntities: NftEventEntity[];
    nftEntitiesMap: Map < string, NftEntity >;
    historyTableState: TableState;

    // purchases tab
    purchaseTransactionEntities: PurchaseTransactionEntity[];
    purchasesTableState: TableState;
    purchaseTransactionsFilterModel: PurchaseTransactionsFilterModel;

    constructor(walletStore: WalletStore, nftRepo: NftRepo, collectionRepo: CollectionRepo, statisticsRepo: StatisticsRepo) {
        this.walletStore = walletStore;
        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;
        this.statisticsRepo = statisticsRepo;

        this.initVariables();

        makeAutoObservable(this, {
            nftFilterModel: false,
        });
    }

    initVariables() {
        this.profilePage = ProfilePages.NFTS;
        this.gridViewState = new GridViewState(this.fetchMyNfts, 3, 4, 6)
        this.nftFilterModel = new NftFilterModel();
        this.nftFilterModel.sessionAccount = S.INT_TRUE;

        this.nftEntities = null;
        this.collectionEntitiesMap = new Map();

        this.defaultIntervalPickerState = new DefaultIntervalPickerState(this.fetchEarnings);
        this.userEarningsEntity = null;

        this.nftEventFilterModel = new NftEventFilterModel();
        this.nftEventFilterModel.sessionAccount = S.INT_TRUE;
        this.nftEventEntities = null;
        this.nftEntitiesMap = new Map();
        this.historyTableState = new TableState(0, [], this.fetchHistory, 10);

        this.purchaseTransactionEntities = null;
        this.purchasesTableState = new TableState(0, [], this.fetchPurchases, 10);
        this.purchaseTransactionsFilterModel = new PurchaseTransactionsFilterModel();
    }

    async init() {
        this.initVariables();

        await this.fetchMyNfts();
        await this.fetchEarnings();
        await this.fetchHistory();
        await this.fetchPurchases();
    }

    fetchMyNfts = async () => {
        this.gridViewState.setIsLoading(true);

        this.nftFilterModel.from = this.gridViewState.getFrom();
        this.nftFilterModel.count = this.gridViewState.getItemsPerPage();

        const fetchedNftEntities = await this.nftRepo.fetchNftsByFilter(this.nftFilterModel);
        const collectionIds = fetchedNftEntities.nftEntities.filter((nftEntity) => {
            return this.collectionEntitiesMap.has(nftEntity.collectionId) === false;
        }).map((nftEntity) => {
            return nftEntity.collectionId;
        });

        const collectionEntitiesMap = new Map(this.collectionEntitiesMap);
        if (collectionIds.length > 0) {
            const collectionEntities = await this.collectionRepo.fetchCollectionsByIds(collectionIds);
            collectionEntities.forEach((collectionEntity) => {
                collectionEntitiesMap.set(collectionEntity.id, collectionEntity);
            });
        }

        await runInActionAsync(() => {
            this.collectionEntitiesMap = collectionEntitiesMap;
            this.nftEntities = fetchedNftEntities.nftEntities;
            this.gridViewState.setTotalItems(fetchedNftEntities.total);
            this.gridViewState.setIsLoading(false);
        });
    }

    fetchEarnings = async () => {
        const defaultIntervalPickerState = this.defaultIntervalPickerState;
        const userEarningsEntity = await this.statisticsRepo.fetchNftEarningsBySessionAccount(defaultIntervalPickerState.earningsTimestampFrom, defaultIntervalPickerState.earningsTimestampTo);

        await runInActionAsync(() => {
            this.userEarningsEntity = userEarningsEntity;
        });
    }

    fetchHistory = async () => {
        this.nftEventFilterModel.from = this.historyTableState.tableFilterState.from;
        this.nftEventFilterModel.count = this.historyTableState.tableFilterState.itemsPerPage;
        this.nftEventFilterModel.sessionAccount = S.INT_TRUE;
        const { nftEventEntities, total } = await this.statisticsRepo.fetchNftEvents(this.nftEventFilterModel);

        const nftIds = nftEventEntities.filter((nftEventEntity) => {
            return this.nftEntitiesMap.has(nftEventEntity.nftId) === false;
        }).map((nftEventEntity) => {
            return nftEventEntity.nftId;
        }).filter((id, index) => nftEventEntities.findIndex((nftEvent) => nftEvent.nftId === id) === index);

        const nftEntitiesMap = this.nftEntitiesMap;
        if (nftIds.length > 0) {
            const nftEntities = await this.nftRepo.fetchNftByIds(nftIds);

            nftEntities.forEach((nftEntity) => {
                nftEntitiesMap.set(nftEntity.id, nftEntity);
            });
        }

        await runInActionAsync(() => {
            this.nftEntitiesMap = null;
            this.nftEntitiesMap = nftEntitiesMap;

            this.nftEventEntities = nftEventEntities;
            this.historyTableState.tableFilterState.total = total;
        });
    }

    fetchPurchases = async () => {
        this.purchaseTransactionsFilterModel.from = this.purchasesTableState.tableFilterState.from;
        this.purchaseTransactionsFilterModel.count = this.purchasesTableState.tableFilterState.itemsPerPage;
        const { purchaseTransactionEntities, total } = await this.nftRepo.fetchPurchaseTransactions(this.purchaseTransactionsFilterModel);

        await runInActionAsync(() => {
            this.purchaseTransactionEntities = purchaseTransactionEntities;
            this.purchasesTableState.tableFilterState.total = total;
        })
    }

    isMyNftTab(): boolean {
        return this.profilePage === ProfilePages.NFTS;
    }

    isMyEarningsTab(): boolean {
        return this.profilePage === ProfilePages.EARNINGS;
    }

    isMyHistoryTab(): boolean {
        return this.profilePage === ProfilePages.HISTORY;
    }

    isPurchasesTab(): boolean {
        return this.profilePage === ProfilePages.PURCHASES;
    }

    markMyNftTab = action(() => {
        this.profilePage = ProfilePages.NFTS;
    })

    markMyEarningsTab = action(() => {
        this.profilePage = ProfilePages.EARNINGS;
    })

    markMyHistoryTab = action(() => {
        this.profilePage = ProfilePages.HISTORY;
    })

    markPurchasesTab = action(() => {
        this.profilePage = ProfilePages.PURCHASES;
    })

    getCollectionName(collectionId: string): string {
        return this.collectionEntitiesMap.get(collectionId)?.name ?? '';
    }

    getCollectionById(collectionId: string): CollectionEntity {
        return this.collectionEntitiesMap.get(collectionId) ?? null;
    }

    onChangeSortKey = (sortKey: number) => {
        this.nftFilterModel.orderBy = sortKey;
        this.fetchMyNfts();
    }

    onChangeTableFilter = action((value: number) => {
        this.nftEventFilterModel.eventTypes = [value];
        this.fetchHistory();
    })

    getNftEntityById = (nftId: string): NftEntity => {
        return this.nftEntitiesMap.get(nftId);
    }
}
