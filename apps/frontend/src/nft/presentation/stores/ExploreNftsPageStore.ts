import GridViewState from '../../../core/presentation/stores/GridViewState';
import { makeAutoObservable } from 'mobx';
import NftEntity from '../../entities/NftEntity';
import NftFilterModel, { NftOrderBy } from '../../utilities/NftFilterModel';
import NftRepo from '../repos/NftRepo';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import TimeoutHelper from '../../../core/helpers/TimeoutHelper';

export default class ExploreNftsPageStore {

    nftRepo: NftRepo;
    collectionRepo: CollectionRepo;

    gridViewState: GridViewState;
    nftFilterModel: NftFilterModel;

    nftEntities: NftEntity[];
    collectionEntitiesMap: Map < string, CollectionEntity >;
    searchTimeoutHelper: TimeoutHelper;

    constructor(nftRepo: NftRepo, collectionRepo: CollectionRepo) {
        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;

        this.gridViewState = new GridViewState(this.fetch, 3, 4, 6);
        this.nftFilterModel = new NftFilterModel();
        this.nftFilterModel.orderBy = NftOrderBy.PRICE_ASC;
        this.nftFilterModel.markApprovedCollections();

        this.nftEntities = null;
        this.collectionEntitiesMap = null;

        this.searchTimeoutHelper = new TimeoutHelper();

        makeAutoObservable(this);
    }

    async init() {
        await this.fetch();
    }

    fetch = async () => {
        this.gridViewState.setIsLoading(true);

        this.nftFilterModel.from = this.gridViewState.getFrom();
        this.nftFilterModel.count = this.gridViewState.getItemsPerPage();

        const { nftEntities, total } = await this.nftRepo.fetchNftsByFilter(this.nftFilterModel)
        const collectionEntities = await this.collectionRepo.fetchCollectionsByIds(nftEntities.map((nftEntity) => {
            return nftEntity.collectionId;
        }));

        const collectionEntitiesMap = new Map();
        collectionEntities.forEach((collectionEntity) => {
            collectionEntitiesMap.set(collectionEntity.id, collectionEntity);
        });

        await runInActionAsync(() => {
            this.collectionEntitiesMap = collectionEntitiesMap;
            this.nftEntities = nftEntities;
            this.gridViewState.setTotalItems(total);
            this.gridViewState.setIsLoading(false);
        });
    }

    getCollectioName(collectionId: string): string {
        return this.collectionEntitiesMap.get(collectionId)?.name ?? '';
    }

    onChangeSearchWord = (value) => {
        this.nftFilterModel.searchString = value;
        this.searchTimeoutHelper.signal(this.fetch);
    }

    onChangeSortType = (value) => {
        this.nftFilterModel.orderBy = value;
        this.searchTimeoutHelper.signal(this.fetch);
    }

    onChangeHashRateMin = (value) => {
        this.nftFilterModel.parseMinHashRate(value);
        this.searchTimeoutHelper.signal(this.fetch);
    }

    onChangeHashRateMax = (value) => {
        this.nftFilterModel.parseMaxHashRate(value);
        this.searchTimeoutHelper.signal(this.fetch);
    }

    onChangePriceType = (value) => {
        this.nftFilterModel.priceFilterType = value;
        this.searchTimeoutHelper.signal(this.fetch);
    }

    onChangePriceMin = (value) => {
        this.nftFilterModel.parseMinPrice(value);
        this.searchTimeoutHelper.signal(this.fetch);
    }

    onChangePriceMax = (value) => {
        this.nftFilterModel.parseMaxPrice(value);
        this.searchTimeoutHelper.signal(this.fetch);
    }

    getHashRateMinValue(): string {
        return this.nftFilterModel.hasHashRateMin() === true ? this.nftFilterModel.hashRateMin.toString() : '';
    }

    getHashRateMaxValue(): string {
        return this.nftFilterModel.hasHashRateMax() === true ? this.nftFilterModel.hashRateMax.toString() : '';
    }

    getPriceMinValue(): string {
        return this.nftFilterModel.hasPriceMin() === true ? this.nftFilterModel.priceMin.toString() : '';
    }

    getPriceMaxValue(): string {
        return this.nftFilterModel.hasPriceMax() === true ? this.nftFilterModel.priceMax.toString() : '';
    }

    changeExpirationPeriodTo(index: number) {
        switch (index) {
            case 0:
                this.nftFilterModel.expiryMax = Date.now() + (365 * 24 * 60 * 60 * 1000);
                this.nftFilterModel.resetExpiryMin();
                break;
            case 1:
                this.nftFilterModel.expiryMin = Date.now() + (365 * 24 * 60 * 60 * 1000);
                this.nftFilterModel.resetExpiryMax();
                break;
            case 2:
                this.nftFilterModel.expiryMin = Date.now() + (2 * 365 * 24 * 60 * 60 * 1000);
                this.nftFilterModel.resetExpiryMax();
                break;
            case 3:
                this.nftFilterModel.expiryMin = Date.now() + (3 * 365 * 24 * 60 * 60 * 1000);
                this.nftFilterModel.resetExpiryMax();
                break;
            default:
                this.nftFilterModel.resetExpiryMin();
                this.nftFilterModel.resetExpiryMax();
                break;
        }

        this.searchTimeoutHelper.signal(this.fetch);
    }
}
