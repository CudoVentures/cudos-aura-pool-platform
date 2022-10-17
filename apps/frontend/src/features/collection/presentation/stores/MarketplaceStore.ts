import { makeAutoObservable } from 'mobx';
import CollectionEntity from '../../entities/CollectionEntity';
import S from '../../../../core/utilities/Main';
import CollectionRepo from '../repos/CollectionRepo';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import NftEntity from '../../../nft/entities/NftEntity';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';

export default class MarketplaceStore {

    static TOP_COLLECTION_PERIODS = [
        '1 Day',
        '7 Days',
        '30 Days',
    ]

    cudosStore: CudosStore;

    collectionRepo: CollectionRepo;
    nftRepo: NftRepo;
    miningFarmRepo: MiningFarmRepo;

    selectedCategoryIndex: number;
    searchString: string;
    selectedTopCollectionPeriod: number;

    collectionMap: Map < string, CollectionEntity >;
    topCollectionEntities: CollectionEntity[];
    newNftDropsEntities: NftEntity[];
    trendingNftEntities: NftEntity[];
    popularFarmsEntities: MiningFarmEntity[];

    cudosPrice: number;
    cudosPriceChange: number;
    categories: string[];

    constructor(cudosStore: CudosStore, collectionRepo: CollectionRepo, nftRepo: NftRepo, miningFarmRepo: MiningFarmRepo) {
        this.cudosStore = cudosStore;
        this.collectionRepo = collectionRepo;
        this.nftRepo = nftRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.collectionMap = new Map < string, CollectionEntity >();

        this.categories = [];
        this.cudosPrice = S.NOT_EXISTS;
        this.cudosPriceChange = S.NOT_EXISTS;

        this.resetDefaults();

        makeAutoObservable(this);
    }

    resetDefaults = () => {
        this.selectedCategoryIndex = 0;
        this.searchString = S.Strings.EMPTY;
        this.selectedTopCollectionPeriod = 0;

        this.topCollectionEntities = [];
        this.newNftDropsEntities = [];
        this.trendingNftEntities = [];
        this.popularFarmsEntities = [];
    }

    async init() {
        await this.cudosStore.init();

        this.resetDefaults();

        // fetching data
        this.categories = await this.collectionRepo.fetchCategories();
        await this.fetchTopCollections();
        await this.fetchNewNftDrops();
        this.fetchTrendingNfts();
        this.fetchPopularFarms();

        this.cudosPrice = this.cudosStore.getCudosPrice();
        this.cudosPriceChange = this.cudosStore.getBitcoinPriceChange();
    }

    async fetchTopCollections() {
        this.topCollectionEntities = await this.collectionRepo.fetchTopCollections(this.selectedTopCollectionPeriod);

        this.addCollectionsToMap(this.topCollectionEntities);
    }

    async fetchNewNftDrops() {
        this.newNftDropsEntities = await this.nftRepo.fetchNewNftDrops();

        await this.fetchCollectionsForEntities(this.newNftDropsEntities);
    }

    async fetchTrendingNfts() {
        this.trendingNftEntities = await this.nftRepo.fetchTrendingNfts();

        await this.fetchCollectionsForEntities(this.trendingNftEntities);
    }

    async fetchPopularFarms() {
        this.popularFarmsEntities = await this.miningFarmRepo.fetchPopularMiningFarms();
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

    selectCategory(index: number) {
        this.selectedCategoryIndex = index;
    }

    changeTopCollectionPeriod = (index: number) => {
        this.selectedTopCollectionPeriod = index;
        // TODO: get new preview models from new period;
    }

    changeSearchString = (searchString: string) => {
        this.searchString = searchString;
    }

    cudosPriceChangeDisplay() {
        const priceChange = this.cudosPriceChange === S.NOT_EXISTS ? 0 : this.cudosPriceChange;

        const sign = priceChange >= 0 ? '+' : '-';

        return `${sign} ${priceChange.toFixed(1)}%`;
    }
}
