import { makeAutoObservable, runInAction } from 'mobx';
import CollectionEntity from '../../entities/CollectionEntity';
import CollectionRepo from '../repos/CollectionRepo';
import NftEntity from '../../../nft/entities/NftEntity';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';
import DefaultIntervalPickerState from '../../../analytics/presentation/stores/DefaultIntervalPickerState';
import MiningFarmDetailsEntity from '../../../mining-farm/entities/MiningFarmDetailsEntity';

export default class MarketplaceStore {

    collectionRepo: CollectionRepo;
    nftRepo: NftRepo;
    miningFarmRepo: MiningFarmRepo;

    defaultIntervalPickerState: DefaultIntervalPickerState;

    collectionMap: Map < string, CollectionEntity >;
    collectionDetailsMap: Map < string, CollectionDetailsEntity >;
    topCollectionEntities: CollectionEntity[];
    newNftDropsEntities: NftEntity[];
    trendingNftEntities: NftEntity[];
    popularFarmsEntities: MiningFarmEntity[];
    miningFarmDetailsMap: Map < string, MiningFarmDetailsEntity >;

    constructor(collectionRepo: CollectionRepo, nftRepo: NftRepo, miningFarmRepo: MiningFarmRepo) {
        this.collectionRepo = collectionRepo;
        this.nftRepo = nftRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.defaultIntervalPickerState = new DefaultIntervalPickerState(this.fetchTopCollections);

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

        runInAction(() => {
            this.topCollectionEntities = topCollectionEntities;
            this.collectionDetailsMap = collectionDetailsMap;
        });
    }

    async fetchNewNftDrops() {
        const newNftDropsEntities = await this.nftRepo.fetchNewNftDrops();

        await this.fetchCollectionsForEntities(this.newNftDropsEntities);
        this.newNftDropsEntities = newNftDropsEntities;
    }

    async fetchTrendingNfts() {
        this.trendingNftEntities = await this.nftRepo.fetchTrendingNfts();

        await this.fetchCollectionsForEntities(this.trendingNftEntities);
    }

    async fetchPopularFarms() {
        const popularFarmsEntities = await this.miningFarmRepo.fetchPopularMiningFarms();

        const miningFarmIds = popularFarmsEntities.map((miningFarmEntity) => miningFarmEntity.id);

        const miningFarmDetailsEntities = await this.miningFarmRepo.fetchMiningFarmsDetailsByIds(miningFarmIds);
        const miningFarmDetailsMap = new Map();
        miningFarmDetailsEntities.forEach((miningFarmDetailsEntity) => {
            miningFarmDetailsMap.set(miningFarmDetailsEntity.miningFarmId, miningFarmDetailsEntity);
        });

        runInAction(() => {
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
