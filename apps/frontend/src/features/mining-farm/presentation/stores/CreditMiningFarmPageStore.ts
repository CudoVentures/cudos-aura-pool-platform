import { makeAutoObservable, runInAction } from 'mobx';
import CollectionEntity, { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import MiningFarmRepo from '../repos/MiningFarmRepo';
import CollectionFilterModel from '../../../collection/utilities/CollectionFilterModel';
import GridViewState from '../../../../core/presentation/stores/GridViewState';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import S from '../../../../core/utilities/Main';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';

export default class CreditMiningFarmPageStore {

    miningFarmRepo: MiningFarmRepo;
    collectionRepo: CollectionRepo;
    nftRepo: NftRepo;

    gridViewState: GridViewState;
    collectionFilterModel: CollectionFilterModel;

    inited: boolean;
    miningFarmEntity: MiningFarmEntity;
    miningFarmDetailsEntity: MiningFarmDetailsEntity;
    collectionEntities: CollectionEntity[];

    constructor(miningFarmRepo: MiningFarmRepo, collectionRepo: CollectionRepo, nftRepo: NftRepo) {
        this.miningFarmRepo = miningFarmRepo;
        this.collectionRepo = collectionRepo;
        this.nftRepo = nftRepo;

        this.gridViewState = new GridViewState(this.fetchCollections, 3, 4, 6);
        this.collectionFilterModel = new CollectionFilterModel();
        this.collectionFilterModel.markAnyCollectins();

        this.inited = false;
        this.miningFarmEntity = null;
        this.miningFarmDetailsEntity = null;
        this.collectionEntities = null;

        makeAutoObservable(this);
    }

    async init(farmId = S.Strings.NOT_EXISTS) {
        this.inited = false;
        this.miningFarmEntity = null;
        this.miningFarmDetailsEntity = null;
        this.collectionEntities = null;

        if (farmId === S.Strings.NOT_EXISTS) {
            this.miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId(MiningFarmStatus.ANY);
            this.collectionFilterModel.status = CollectionStatus.ANY;
        } else {
            this.miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmById(farmId);
        }

        if (this.miningFarmEntity !== null) {
            this.collectionFilterModel.farmId = this.miningFarmEntity.id;
            await this.fetchMiningFarmDetails();
            await this.fetchCollections();
        }
        this.inited = true;
    }

    async fetchMiningFarmDetails() {
        try {
            this.miningFarmDetailsEntity = await this.miningFarmRepo.fetchMiningFarmDetailsById(this.miningFarmEntity.id);
        } catch (e) {
            console.log(e);
        }
    }

    fetchCollections = async () => {
        this.gridViewState.setIsLoading(true);

        this.collectionFilterModel.from = this.gridViewState.getFrom();
        this.collectionFilterModel.count = this.gridViewState.getItemsPerPage();
        const { collectionEntities, total } = await this.collectionRepo.fetchCollectionsByFilter(this.collectionFilterModel);

        runInAction(() => {
            this.collectionEntities = collectionEntities;
            this.gridViewState.setTotalItems(total);
            this.gridViewState.setIsLoading(false);
        });

    }

    onChangeSearchWord = (searchString: string) => {
        this.collectionFilterModel.searchString = searchString;
        this.fetchCollections();
    }
}
