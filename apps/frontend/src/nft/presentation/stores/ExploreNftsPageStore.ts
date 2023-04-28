import GridViewState from '../../../core/presentation/stores/GridViewState';
import { makeAutoObservable } from 'mobx';
import NftEntity from '../../entities/NftEntity';
import NftFilterModel from '../../utilities/NftFilterModel';
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

        this.gridViewState = new GridViewState(this.fetch, 1, 1, 1);
        this.nftFilterModel = new NftFilterModel();
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

    onChangeSearchWord = async (value) => {
        this.nftFilterModel.searchString = value;
        this.searchTimeoutHelper.signal(this.fetch);
    }

}
