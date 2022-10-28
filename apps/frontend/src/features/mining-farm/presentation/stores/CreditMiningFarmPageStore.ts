import { makeAutoObservable, runInAction } from 'mobx';
import CollectionEntity, { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmRepo from '../repos/MiningFarmRepo';
import CollectionFilterModel, { CollectionHashPowerFilter } from '../../../collection/utilities/CollectionFilterModel';
import GridViewState from '../../../../core/presentation/stores/GridViewState';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftEntity from '../../../nft/entities/NftEntity';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import { Collection } from 'cudosjs/build/stargate/modules/nft/proto-types/nft';

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
    miningFarmEntitiesMap: Map < string, MiningFarmEntity >;

    constructor(miningFarmRepo: MiningFarmRepo, collectionRepo: CollectionRepo, nftRepo: NftRepo) {
        this.miningFarmRepo = miningFarmRepo;
        this.collectionRepo = collectionRepo;
        this.nftRepo = nftRepo;

        this.gridViewState = new GridViewState(this.fetch, 3, 4, 6);
        this.collectionFilterModel = new CollectionFilterModel();

        this.inited = false;
        this.miningFarmEntity = null;
        this.collectionEntities = null;
        this.nftEntities = [];
        this.miningFarmEntitiesMap = null;

        makeAutoObservable(this);
    }

    async init(farmId = '') {
        if (farmId === '') {
            this.miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId();
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
        const miningFarmEntities = await this.miningFarmRepo.fetchMiningFarmsByIds(collectionEntities.map((collectionEntity) => {
            return collectionEntity.farmId;
        }));

        const miningFarmEntitiesMap = new Map();
        miningFarmEntities.forEach((miningFarmEntity) => {
            miningFarmEntitiesMap.set(miningFarmEntity.id, miningFarmEntity);
        });

        const nftFilterModel = new NftFilterModel();
        nftFilterModel.collectionIds = collectionEntities.map((collectionEntity: CollectionEntity) => collectionEntity.id);
        const { nftEntities } = await this.nftRepo.fetchNftsByFilter(nftFilterModel);
        runInAction(() => {
            this.miningFarmEntitiesMap = miningFarmEntitiesMap;
            this.collectionEntities = collectionEntities;
            this.gridViewState.setTotalItems(total);
            this.gridViewState.setIsLoading(false);
        });

        this.nftEntities = nftEntities;
    }

    getMiningFarmName(miningFarmId: string): string {
        return this.miningFarmEntitiesMap.get(miningFarmId)?.name ?? '';
    }

    onChangeSortKey = (sortKey: number) => {
        this.collectionFilterModel.sortKey = sortKey;
        this.fetch();
    }

    onChangeHashPowerFilter = (collectionHashPowerfilter: CollectionHashPowerFilter) => {
        this.collectionFilterModel.hashPowerFilter = collectionHashPowerfilter;
        this.fetch();
    }

    onChangeSearchWord = (searchString: string) => {
        this.collectionFilterModel.searchString = searchString;
        this.fetch();
    }
}
