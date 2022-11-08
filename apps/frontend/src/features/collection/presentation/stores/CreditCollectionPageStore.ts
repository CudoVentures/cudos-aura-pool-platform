import { makeAutoObservable, runInAction } from 'mobx';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';
import CollectionRepo from '../repos/CollectionRepo';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import NftEntity from '../../../nft/entities/NftEntity';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import GridViewState from '../../../../core/presentation/stores/GridViewState';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';

export default class CreditCollectionPageStore {

    nftRepo: NftRepo;
    collectionRepo: CollectionRepo;
    miningFarmRepo: MiningFarmRepo;

    gridViewState: GridViewState;
    nftFilterModel: NftFilterModel;

    collectionEntity: CollectionEntity;
    collectionDetailsEntity: CollectionDetailsEntity;
    miningFarmEntity: MiningFarmEntity;
    nftEntities: NftEntity[];

    constructor(nftRepo: NftRepo, collectionRepo: CollectionRepo, miningFarmRepo: MiningFarmRepo) {
        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.gridViewState = new GridViewState(this.fetchNfts, 3, 4, 6);
        this.nftFilterModel = new NftFilterModel();

        this.collectionEntity = null;
        this.collectionDetailsEntity = null;
        this.miningFarmEntity = null;
        this.nftEntities = null;

        makeAutoObservable(this);
    }

    async init(collectionId: string) {
        this.nftFilterModel.collectionIds = [collectionId];
        this.collectionEntity = await this.collectionRepo.fetchCollectionById(collectionId, CollectionStatus.APPROVED);
        this.miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmById(this.collectionEntity.farmId);
        await this.fetchCollectionDetails();
        await this.fetchNfts();
    }

    async fetchCollectionDetails() {
        this.collectionDetailsEntity = await this.collectionRepo.fetchCollectionDetailsById(this.collectionEntity.id);
    }

    fetchNfts = async () => {
        this.gridViewState.setIsLoading(true);
        this.nftFilterModel.from = this.gridViewState.getFrom();
        this.nftFilterModel.count = this.gridViewState.getItemsPerPage();
        this.nftFilterModel.collectionStatus = CollectionStatus.ANY;
        const { nftEntities, total } = await this.nftRepo.fetchNftsByFilter(this.nftFilterModel);

        runInAction(() => {
            this.nftEntities = nftEntities;
            this.gridViewState.setTotalItems(total);
            this.gridViewState.setIsLoading(false);
        });
    }

}
