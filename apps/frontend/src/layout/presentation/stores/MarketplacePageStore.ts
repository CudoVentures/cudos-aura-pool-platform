import { makeAutoObservable } from 'mobx';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import NftEntity from '../../../nft/entities/NftEntity';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import CollectionDetailsEntity from '../../../collection/entities/CollectionDetailsEntity';
import DefaultIntervalPickerState from '../../../analytics/presentation/stores/DefaultIntervalPickerState';
import MiningFarmDetailsEntity from '../../../mining-farm/entities/MiningFarmDetailsEntity';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import AllowlistRepo from '../../../allowlist/presentation/repos/AllowlistRepo';

export default class MarketplacePageStore {
    alertStore: AlertStore;
    walletStore: WalletStore;

    collectionRepo: CollectionRepo;
    nftRepo: NftRepo;
    miningFarmRepo: MiningFarmRepo;
    allowlistRepo: AllowlistRepo;

    defaultIntervalPickerState: DefaultIntervalPickerState;

    collectionMap: Map < string, CollectionEntity >;
    collectionDetailsMap: Map < string, CollectionDetailsEntity >;
    topCollectionEntities: CollectionEntity[];
    newNftDropsEntities: NftEntity[];
    trendingNftEntities: NftEntity[];
    popularFarmsEntities: MiningFarmEntity[];
    miningFarmDetailsMap: Map < string, MiningFarmDetailsEntity >;

    constructor(alertStore: AlertStore, walletStore: WalletStore, collectionRepo: CollectionRepo, nftRepo: NftRepo, miningFarmRepo: MiningFarmRepo, allowlistRepo: AllowlistRepo) {
        this.walletStore = walletStore;
        this.alertStore = alertStore;

        this.collectionRepo = collectionRepo;
        this.nftRepo = nftRepo;
        this.miningFarmRepo = miningFarmRepo;
        this.defaultIntervalPickerState = new DefaultIntervalPickerState(this.fetchTopCollections);
        this.allowlistRepo = allowlistRepo;

        this.collectionMap = new Map();
        this.collectionDetailsMap = new Map();
        this.topCollectionEntities = [];
        this.newNftDropsEntities = [];
        this.trendingNftEntities = [];
        this.popularFarmsEntities = [];
        this.miningFarmDetailsMap = new Map();

        makeAutoObservable(this);
    }

    async init() {
        await this.fetchTopCollections();
        await this.fetchNewNftDrops();
        this.fetchTrendingNfts();
        this.fetchPopularFarms();
    }

    fetchTopCollections = async () => {
        const topCollectionEntities = await this.collectionRepo.fetchTopCollections(this.defaultIntervalPickerState.earningsTimestampFrom, this.defaultIntervalPickerState.earningsTimestampTo);
        const collectionIds = topCollectionEntities.map((collectionEntity) => {
            return collectionEntity.id;
        });

        const collectionDetails = await this.collectionRepo.fetchCollectionsDetailsByIds(collectionIds);
        const collectionDetailsMap = new Map();
        collectionDetails.forEach((collectionDetailsEntity) => {
            collectionDetailsMap.set(collectionDetailsEntity.collectionId, collectionDetailsEntity);
        });

        this.addCollectionsToMap(topCollectionEntities);

        await runInActionAsync(() => {
            this.topCollectionEntities = topCollectionEntities;
            this.collectionDetailsMap = collectionDetailsMap;
        });
    }

    async fetchNewNftDrops() {
        const newNftDropsEntities = await this.nftRepo.fetchNewNftDrops();
        this.fetchCollectionsForEntities(newNftDropsEntities);

        await runInActionAsync(() => {
            this.newNftDropsEntities = newNftDropsEntities;
        })
    }

    async fetchTrendingNfts() {
        const trendingNftEntities = await this.nftRepo.fetchTrendingNfts();
        this.fetchCollectionsForEntities(trendingNftEntities);

        await runInActionAsync(() => {
            this.trendingNftEntities = trendingNftEntities;
        });
    }

    async fetchPopularFarms() {
        const popularFarmsEntities = await this.miningFarmRepo.fetchPopularMiningFarms();

        const miningFarmIds = popularFarmsEntities.map((miningFarmEntity) => miningFarmEntity.id);

        const miningFarmDetailsEntities = await this.miningFarmRepo.fetchMiningFarmsDetailsByIds(miningFarmIds);
        const miningFarmDetailsMap = new Map();
        miningFarmDetailsEntities.forEach((miningFarmDetailsEntity) => {
            miningFarmDetailsMap.set(miningFarmDetailsEntity.miningFarmId, miningFarmDetailsEntity);
        });

        await runInActionAsync(() => {
            this.popularFarmsEntities = popularFarmsEntities;
            this.miningFarmDetailsMap = miningFarmDetailsMap;
        });
    }

    async fetchCollectionsForEntities(nftEntities: NftEntity[]) {
        const collectionIdsToFetch = nftEntities
            .filter((nftEntity: NftEntity) => this.collectionMap.has(nftEntity.collectionId) === false)
            .map((nftEntity: NftEntity) => nftEntity.collectionId);

        const fetchedCollections = await this.collectionRepo.fetchCollectionsByIds(collectionIdsToFetch);

        this.addCollectionsToMap(fetchedCollections);
    }

    addCollectionsToMap(collectionEntities: CollectionEntity[]) {
        collectionEntities.forEach((collectionEntity: CollectionEntity) => {
            this.collectionMap.set(collectionEntity.id, collectionEntity);
        })
    }

    getCollectionById(collectionId: string) {
        return this.collectionMap.get(collectionId);
    }

    getCollectionName(collectionId: string): string {
        return this.collectionMap.get(collectionId)?.name ?? '';
    }

    getMiningFarmDetailsEntity(miningFarmId: string): MiningFarmDetailsEntity {
        return this.miningFarmDetailsMap.get(miningFarmId) ?? null;
    }
}
