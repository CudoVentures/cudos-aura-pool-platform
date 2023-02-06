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

declare let Config;

export default class MarketplacePageStore {

    collectionRepo: CollectionRepo;
    nftRepo: NftRepo;
    miningFarmRepo: MiningFarmRepo;

    defaultIntervalPickerState: DefaultIntervalPickerState;

    presaleCollectionEntity: CollectionEntity;
    presaleCollectionDetailsEntity: CollectionDetailsEntity;

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
        if (this.isPresaleOver() === false) {
            this.fetchPresaleCollectionWithDetails();
        } else {
            await this.fetchTopCollections();
            await this.fetchNewNftDrops();
            this.fetchTrendingNfts();
            this.fetchPopularFarms();
        }
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

    fetchPresaleCollectionWithDetails = async () => {
        const collectionId = Config.APP_PRSALE_COLLECTION_ID;
        const presaleCollection = await this.collectionRepo.fetchCollectionById(collectionId);
        const collectionDetails = await this.collectionRepo.fetchCollectionsDetailsByIds([collectionId]);
        await runInActionAsync(() => {
            this.presaleCollectionEntity = presaleCollection;
            this.presaleCollectionDetailsEntity = collectionDetails[0];
        })
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

    isPresaleOver(): boolean {
        return this.presaleTimeLeftMilis() < 0;
    }

    getPresaleTimeLeft(): {presaleDaysLeft: number, presaleHoursLeft: number, presaleMinutesLeft: number, presaleSecondsleft: number } {
        const ms = this.presaleTimeLeftMilis();
        const presaleDaysLeft = Math.floor(ms / (24 * 60 * 60 * 1000));
        const daysms = ms % (24 * 60 * 60 * 1000);
        const presaleHoursLeft = Math.floor(daysms / (60 * 60 * 1000));
        const hoursms = ms % (60 * 60 * 1000);
        const presaleMinutesLeft = Math.floor(hoursms / (60 * 1000));
        const minutesms = ms % (60 * 1000);
        const presaleSecondsleft = Math.floor(minutesms / 1000);

        return {
            presaleDaysLeft,
            presaleHoursLeft,
            presaleMinutesLeft,
            presaleSecondsleft,
        }
    }

    private presaleTimeLeftMilis(): number {
        return parseInt(Config.APP_PRESALE_END_TIMESTAMP) - Date.now();
    }

}
