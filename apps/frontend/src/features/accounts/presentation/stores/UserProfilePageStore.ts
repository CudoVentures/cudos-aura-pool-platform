import { makeAutoObservable, runInAction } from 'mobx';
import GridViewState from '../../../../core/presentation/stores/GridViewState';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import S from '../../../../core/utilities/Main';
import NftEntity from '../../../nft/entities/NftEntity';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import ExtendedChartState from '../../../../core/presentation/stores/ExtendedChartState';
import UserRepo from '../repos/UserRepo';
import CollectionEventEntity from '../../../analytics/entities/CollectionEventEntity';
import StatisticsRepo from '../../../analytics/presentation/repos/StatisticsRepo';
import CollectionEventFilterModel from '../../../analytics/entities/CollectionEventFilterModel';
import TableState from '../../../../core/presentation/stores/TableState';

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
    extendedChartState: ExtendedChartState;

    nftEntities: NftEntity[];
    collectionEntitiesMap: Map < string, CollectionEntity >;

    analyticsTableState: TableState;
    collectionEventFilterModel: CollectionEventFilterModel;
    collectionEventEntities: CollectionEventEntity[];

    constructor(walletStore: WalletStore, nftRepo: NftRepo, collectionRepo: CollectionRepo, userRepo: UserRepo, statisticsRepo: StatisticsRepo) {
        this.walletStore = walletStore;

        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;
        this.userRepo = userRepo;
        this.statisticsRepo = statisticsRepo;

        this.profilePage = ProfilePages.NFTS;
        this.gridViewState = new GridViewState(this.fetch, 3, 4, 6)
        this.extendedChartState = new ExtendedChartState(this.fetchStatistics);

        this.nftFilterModel = new NftFilterModel();
        this.nftFilterModel.sessionAccount = S.INT_TRUE;

        this.nftEntities = [];
        this.collectionEntitiesMap = null;

        this.analyticsTableState = new TableState(0, [], this.fetch, 10);
        this.collectionEventFilterModel = new CollectionEventFilterModel();
        this.collectionEventEntities = [];

        makeAutoObservable(this);
    }

    async init() {
        this.nftEntities = [];
        this.collectionEntitiesMap = null;
        this.collectionEventEntities = [];

        await this.fetch();
    }

    fetch = async () => {
        const collectionIdsSet = new Set < string >();

        this.gridViewState.setIsLoading(true);

        this.nftFilterModel.from = this.gridViewState.getFrom();
        this.nftFilterModel.count = this.gridViewState.getItemsPerPage();

        const fetchedNftEntities = await this.nftRepo.fetchNftsByFilter(this.nftFilterModel);
        fetchedNftEntities.nftEntities.forEach((nftEntity: NftEntity) => {
            collectionIdsSet.add(nftEntity.collectionId);
        });

        const fetchedCollectionEventEntities = await this.statisticsRepo.fetchCollectionEventsByFilter(this.collectionEventFilterModel);
        fetchedCollectionEventEntities.collectionEventEntities.forEach((collectionEventEntity) => {
            collectionIdsSet.add(collectionEventEntity.collectionId);
        });

        const collectionEntities = await this.collectionRepo.fetchCollectionsByIds(Array.from(collectionIdsSet));
        const collectionEntitiesMap = new Map();
        collectionEntities.forEach((collectionEntity) => {
            return collectionEntitiesMap.set(collectionEntity.id, collectionEntities);
        });

        runInAction(() => {
            this.nftEntities = fetchedNftEntities.nftEntities;
            this.collectionEntitiesMap = collectionEntitiesMap;
            this.collectionEventEntities = fetchedCollectionEventEntities.collectionEventEntities;
            this.analyticsTableState.tableFilterState.total = fetchedCollectionEventEntities.total;

            this.gridViewState.setTotalItems(fetchedNftEntities.total);
            this.gridViewState.setIsLoading(false);
            this.extendedChartState.init();
        });
    }

    fetchStatistics = (timestamp: number): Promise < number[] > => {
        return this.userRepo.fetchUserEarningsStatistics(this.walletStore.address, timestamp);
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
        this.fetch();
    }

    onChangeTableFilter = (value: number) => {
        this.collectionEventFilterModel.eventType = value;
    }
}
