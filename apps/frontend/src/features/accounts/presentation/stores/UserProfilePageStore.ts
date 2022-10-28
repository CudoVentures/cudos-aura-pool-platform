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
import PoolEventRepo from '../../../analytics/presentation/repos/PoolEventRepo';
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
    poolEventRepo: PoolEventRepo;

    profilePage: number;
    gridViewState: GridViewState;
    nftFilterModel: NftFilterModel;
    extendedChartState: ExtendedChartState;

    nftEntities: NftEntity[];
    collectionEntitiesMap: Map < string, CollectionEntity >;

    analyticsTableState: TableState;
    collectionEventFilterModel: CollectionEventFilterModel;
    collectionEventEntities: CollectionEventEntity[];
    collectionEntitiesDisplay: CollectionEntity[];

    constructor(walletStore: WalletStore, nftRepo: NftRepo, collectionRepo: CollectionRepo, userRepo: UserRepo, poolEventRepo: PoolEventRepo) {
        this.walletStore = walletStore;

        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;
        this.userRepo = userRepo;
        this.poolEventRepo = poolEventRepo;

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
        this.collectionEntitiesDisplay = [];

        makeAutoObservable(this);
    }

    async init() {
        this.nftEntities = [];
        this.collectionEntitiesMap = null;
        this.collectionEventEntities = [];
        this.collectionEntitiesDisplay = [];

        await this.fetch();
    }

    fetch = async () => {
        this.gridViewState.setIsLoading(true);

        this.nftFilterModel.from = this.gridViewState.getFrom();
        this.nftFilterModel.count = this.gridViewState.getItemsPerPage();

        const { nftEntities, total } = await this.nftRepo.fetchNftsByFilter(this.nftFilterModel);
        const collectionEntities = await this.collectionRepo.fetchCollectionsByIds(nftEntities.map((nftEntity: NftEntity) => {
            return nftEntity.collectionId
        }));

        const collectionEntitiesMap = new Map();
        collectionEntities.forEach((collectionEntity) => {
            return collectionEntitiesMap.set(collectionEntity.id, collectionEntities);
        });

        const eventFetchResult = await this.poolEventRepo.fetchCollectionEventsByFilter(this.collectionEventFilterModel);
        const collectionEntitiesDisplay = await this.collectionRepo.fetchCollectionsByIds(eventFetchResult.collectionEventEntities.map((eventEntity: CollectionEventEntity) => eventEntity.collectionId));

        runInAction(() => {
            this.nftEntities = nftEntities;
            this.collectionEntitiesMap = collectionEntitiesMap;
            this.collectionEntitiesDisplay = collectionEntitiesDisplay;
            this.collectionEventEntities = eventFetchResult.collectionEventEntities;
            this.analyticsTableState.tableFilterState.total = eventFetchResult.total;

            this.gridViewState.setTotalItems(total);
            this.gridViewState.setIsLoading(false);
            this.extendedChartState.init();
        });
    }

    fetchStatistics = (timestamp: number): Promise < number[] > => {
        return this.userRepo.fetchUserEarningsStatistics(this.walletStore.address, timestamp);
    }

    isNftPage(): boolean {
        return this.profilePage === ProfilePages.NFTS;
    }

    isEarningsPage(): boolean {
        return this.profilePage === ProfilePages.EARNINGS;
    }

    isHistoryPage(): boolean {
        return this.profilePage === ProfilePages.HISTORY;
    }

    markNftPage = () => {
        this.profilePage = ProfilePages.NFTS;
    }

    markEarningsPage = () => {
        this.profilePage = ProfilePages.EARNINGS;
    }

    markHistoryPage = () => {
        this.profilePage = ProfilePages.HISTORY;
    }

    getCollectionName(collectionId: string): string {
        return this.collectionEntitiesMap.get(collectionId)?.name ?? '';
    }

    onChangeSortKey = (sortKey: number) => {
        this.nftFilterModel.sortKey = sortKey;
        this.fetch();
    }

    getCollectionById(collectionId: string): CollectionEntity {
        return this.collectionEntitiesDisplay.find((collectionEntity: CollectionEntity) => collectionEntity.id === collectionId);
    }

    onChangeTableFilter = (value: number) => {
        this.collectionEventFilterModel.eventType = value;
    }
}
