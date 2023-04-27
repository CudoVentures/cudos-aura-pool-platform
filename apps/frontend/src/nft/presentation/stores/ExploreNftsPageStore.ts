import GridViewState from '../../../core/presentation/stores/GridViewState';
import { makeAutoObservable } from 'mobx';
import NftEntity from '../../entities/NftEntity';
import NftFilterModel, { NftOrderBy } from '../../utilities/NftFilterModel';
import NftRepo from '../repos/NftRepo';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import TimeoutHelper from '../../../core/helpers/TimeoutHelper';
import S from '../../../core/utilities/Main';

export default class ExploreNftsPageStore {

    nftRepo: NftRepo;
    collectionRepo: CollectionRepo;

    gridViewState: GridViewState;
    nftFilterModel: NftFilterModel;

    nftEntities: NftEntity[];
    collectionEntitiesMap: Map < string, CollectionEntity >;
    searchTimeoutHelper: TimeoutHelper;

    showFilterSection: boolean;
    selectedExpirationPeriod: number[];

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
        this.showFilterSection = false;

        this.selectedExpirationPeriod = [S.INT_FALSE, S.INT_FALSE, S.INT_FALSE, S.INT_FALSE];

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

    onChangeSearchWord = async (value) => {
        this.nftFilterModel.searchString = value;
        this.searchTimeoutHelper.signal(this.fetch);
    }

    onChangeSortType = async (value) => {
        this.nftFilterModel.orderBy = value;
        this.searchTimeoutHelper.signal(this.fetch);
    }

    toggleOpenFilterSection = () => {
        this.showFilterSection = !this.showFilterSection;
    }

    getHashRateMinValue(): string {
        return this.nftFilterModel.hashRateMin === Number.MIN_SAFE_INTEGER ? '' : this.nftFilterModel.hashRateMin.toString();
    }

    onChangeHashRateMin = (value) => {
        this.nftFilterModel.parseMinHashRate(value);
        this.searchTimeoutHelper.signal(this.fetch);
    }

    getHashRateMaxValue(): string {
        return this.nftFilterModel.hashRateMax === Number.MAX_SAFE_INTEGER ? '' : this.nftFilterModel.hashRateMax.toString();

    }

    onChangeHashRateMax = (value) => {
        this.nftFilterModel.parseMaxHashRate(value);
        this.searchTimeoutHelper.signal(this.fetch);
    }

    getPriceMinValue(): string {
        return this.nftFilterModel.priceMin.eq(Number.MIN_SAFE_INTEGER) ? '' : this.nftFilterModel.priceMin.toString();
    }

    onChangePriceMin = (value) => {
        this.nftFilterModel.parseMinPrice(value);
        this.searchTimeoutHelper.signal(this.fetch);
    }

    getPriceMaxValue(): string {
        return this.nftFilterModel.priceMax.eq(Number.MAX_SAFE_INTEGER) ? '' : this.nftFilterModel.priceMax.toString();

    }

    onChangePriceMax = (value) => {
        this.nftFilterModel.parseMaxPrice(value);
        this.searchTimeoutHelper.signal(this.fetch);
    }

    onChangePriceType = (value) => {
        this.nftFilterModel.priceFilterType = value;
        this.searchTimeoutHelper.signal(this.fetch);
    }

    onChangeExpirationPeriod = (index) => {
        const prevValue = this.selectedExpirationPeriod[index];
        this.selectedExpirationPeriod = [S.INT_FALSE, S.INT_FALSE, S.INT_FALSE, S.INT_FALSE];
        this.selectedExpirationPeriod[index] = prevValue === S.INT_FALSE ? S.INT_TRUE : S.INT_FALSE;

        if (this.selectedExpirationPeriod[index] === S.INT_FALSE) {
            index = -1;
        }

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
