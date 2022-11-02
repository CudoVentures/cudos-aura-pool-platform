import { makeAutoObservable, runInAction } from 'mobx';
import GridViewState from '../../../../core/presentation/stores/GridViewState';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import S from '../../../../core/utilities/Main';
import NftEntity from '../../../nft/entities/NftEntity';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import UserRepo from '../repos/UserRepo';
import StatisticsRepo from '../../../analytics/presentation/repos/StatisticsRepo';
import TableState from '../../../../core/presentation/stores/TableState';
import NftEventFilterModel from '../../../analytics/entities/NftEventFilterModel';
import NftEventEntity from '../../../analytics/entities/NftEventEntity';
import UserEarningsEntity from '../../../analytics/entities/UserEarningsEntity';
import DefaultIntervalPickerState from '../../../analytics/presentation/stores/DefaultIntervalPickerState';

export enum ProfilePages {
    NFTS,
    EARNINGS,
    HISTORY
}

export default class UserProfilePageStore {

    walletStore: WalletStore;
    userRepo: UserRepo;
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

    constructor(walletStore: WalletStore, nftRepo: NftRepo, collectionRepo: CollectionRepo, userRepo: UserRepo, statisticsRepo: StatisticsRepo) {
        this.walletStore = walletStore;
        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;
        this.userRepo = userRepo;
        this.statisticsRepo = statisticsRepo;

        this.profilePage = ProfilePages.NFTS;
        this.gridViewState = new GridViewState(this.fetchMyNfts, 3, 4, 6)
        this.nftFilterModel = new NftFilterModel();
        this.nftFilterModel.sessionAccount = S.INT_TRUE;

        this.nftEntities = null;
        this.collectionEntitiesMap = null;

        this.defaultIntervalPickerState = new DefaultIntervalPickerState(this.fetchEarnings);
        this.userEarningsEntity = null;

        this.nftEventFilterModel = new NftEventFilterModel();
        this.nftEventFilterModel.sessionAccount = S.INT_TRUE;
        this.nftEventEntities = null;
        this.nftEntitiesMap = new Map();
        this.historyTableState = new TableState(0, [], this.fetchHistory, 10);

        makeAutoObservable(this);
    }

    async init() {
        await this.fetchMyNfts();
        await this.fetchEarnings();
        await this.fetchHistory();
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

        const collectionEntitiesMap = this.collectionEntitiesMap;
        if (collectionIds.length > 0) {
            const collectionEntities = await this.collectionRepo.fetchCollectionsByIds(collectionIds);
            collectionEntities.forEach((collectionEntity) => {
                collectionEntitiesMap.set(collectionEntity.id, collectionEntity);
            });
        }

        runInAction(() => {
            this.collectionEntitiesMap = null;
            this.collectionEntitiesMap = collectionEntitiesMap;
            this.nftEntities = fetchedNftEntities.nftEntities;
            this.gridViewState.setTotalItems(fetchedNftEntities.total);
            this.gridViewState.setIsLoading(false);
        });
    }

    fetchEarnings = async (): Promise < void > => {
        const defaultIntervalPickerState = this.defaultIntervalPickerState;
        this.userEarningsEntity = await this.statisticsRepo.fetchNftEarningsBySessionAccount(defaultIntervalPickerState.earningsTimestampFrom, defaultIntervalPickerState.earningsTimestampTo);
    }

    fetchHistory = async () => {
        this.nftEventFilterModel.from = this.historyTableState.tableFilterState.from;
        this.nftEventFilterModel.count = this.historyTableState.tableFilterState.itemsPerPage;
        const { nftEventEntities, total } = await this.statisticsRepo.fetchNftEvents(this.nftEventFilterModel);

        const nftIds = nftEventEntities.filter((nftEventEntity) => {
            return this.nftEntitiesMap.has(nftEventEntity.nftId) === false;
        }).map((nftEventEntity) => {
            return nftEventEntity.nftId;
        });

        const nftEntitiesMap = this.nftEntitiesMap;
        if (nftIds.length > 0) {
            const nftEntities = await this.nftRepo.fetchNftByIds(nftIds);

            nftEntities.forEach((nftEntity) => {
                nftEntitiesMap.set(nftEntity.id, nftEntity);
            });
        }

        runInAction(() => {
            this.nftEntitiesMap = null;
            this.nftEntitiesMap = nftEntitiesMap;

            this.nftEventEntities = nftEventEntities;
            this.historyTableState.tableFilterState.total = total;
        });
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

    markMyNftTab = () => {
        this.profilePage = ProfilePages.NFTS;
    }

    markMyEarningsTab = () => {
        this.profilePage = ProfilePages.EARNINGS;
    }

    markMyHistoryTab = () => {
        this.profilePage = ProfilePages.HISTORY;
    }

    getCollectionName(collectionId: string): string {
        return this.collectionEntitiesMap.get(collectionId)?.name ?? '';
    }

    getCollectionById(collectionId: string): CollectionEntity {
        return this.collectionEntitiesMap.get(collectionId) ?? null;
    }

    onChangeSortKey = (sortKey: number) => {
        this.nftFilterModel.sortKey = sortKey;
        this.fetchMyNfts();
    }

    onChangeTableFilter = (value: number) => {
        this.nftEventFilterModel.eventType = value;
    }

    getNftEntityById = (nftId: string): NftEntity => {
        return this.nftEntitiesMap.get(nftId);
    }
}
