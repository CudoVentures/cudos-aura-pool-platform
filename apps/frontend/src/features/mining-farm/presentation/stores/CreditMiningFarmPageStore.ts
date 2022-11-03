import { makeAutoObservable, runInAction } from 'mobx';
import CollectionEntity, { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import MiningFarmRepo from '../repos/MiningFarmRepo';
import CollectionFilterModel from '../../../collection/utilities/CollectionFilterModel';
import GridViewState from '../../../../core/presentation/stores/GridViewState';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftEntity from '../../../nft/entities/NftEntity';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import S from '../../../../core/utilities/Main';

export default class CreditMiningFarmPageStore {

    miningFarmRepo: MiningFarmRepo;
    collectionRepo: CollectionRepo;
    nftRepo: NftRepo;

    gridViewState: GridViewState;
    collectionFilterModel: CollectionFilterModel;

    inited: boolean;
    miningFarmEntity: MiningFarmEntity;
    collectionEntities: CollectionEntity[];
    nftEntities: NftEntity[];

    constructor(miningFarmRepo: MiningFarmRepo, collectionRepo: CollectionRepo, nftRepo: NftRepo) {
        this.miningFarmRepo = miningFarmRepo;
        this.collectionRepo = collectionRepo;
        this.nftRepo = nftRepo;

        this.gridViewState = new GridViewState(this.fetch, 3, 4, 6);
        this.collectionFilterModel = new CollectionFilterModel();
        this.collectionFilterModel.markAnyCollectins();

        this.inited = false;
        this.miningFarmEntity = null;
        this.collectionEntities = null;
        this.nftEntities = [];

        makeAutoObservable(this);
    }

    async init(farmId = S.Strings.NOT_EXISTS) {
        if (farmId === S.Strings.NOT_EXISTS) {
            this.miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId(MiningFarmStatus.ANY);
            this.collectionFilterModel.status = CollectionStatus.ANY;
        } else {
            this.miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmById(farmId);
        }

        this.inited = true;
        if (this.miningFarmEntity !== null) {
            this.collectionFilterModel.farmId = this.miningFarmEntity.id;
            await this.fetch();
        }
    }

    fetch = async () => {
        this.gridViewState.setIsLoading(true);

        this.collectionFilterModel.from = this.gridViewState.getFrom();
        this.collectionFilterModel.count = this.gridViewState.getItemsPerPage();
        const { collectionEntities, total } = await this.collectionRepo.fetchCollectionsByFilter(this.collectionFilterModel);

        const nftFilterModel = new NftFilterModel();
        nftFilterModel.collectionIds = collectionEntities.map((collectionEntity: CollectionEntity) => collectionEntity.id);
        const { nftEntities } = await this.nftRepo.fetchNftsByFilter(nftFilterModel, this.collectionFilterModel.status);
        runInAction(() => {
            this.collectionEntities = collectionEntities;
            this.gridViewState.setTotalItems(total);
            this.gridViewState.setIsLoading(false);
            this.nftEntities = nftEntities;
        });

    }

    onChangeSearchWord = (searchString: string) => {
        this.collectionFilterModel.searchString = searchString;
        this.fetch();
    }
}
