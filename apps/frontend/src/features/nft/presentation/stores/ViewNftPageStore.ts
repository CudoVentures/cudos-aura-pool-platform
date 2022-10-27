import S from '../../../../core/utilities/Main';
import { makeAutoObservable, runInAction } from 'mobx';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftEntity, { NftListinStatus } from '../../entities/NftEntity';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import NftFilterModel from '../../utilities/NftFilterModel';
import GridViewState from '../../../../core/presentation/stores/GridViewState';
import ExtendedChartState from '../../../../core/presentation/stores/ExtendedChartState';

export default class ViewNftPageStore {

    bitcoinStore: BitcoinStore;
    cudosStore: CudosStore;

    nftRepo: NftRepo;
    collectionRepo: CollectionRepo;
    miningFarmRepo: MiningFarmRepo;
    gridViewState: GridViewState;

    extendedChartState: ExtendedChartState;
    cudosPrice: number;
    bitcoinPrice: number;
    nftEntity: NftEntity;
    collectionEntity: CollectionEntity;
    miningFarm: MiningFarmEntity;
    nftEntities: NftEntity[];

    constructor(bitcoinStore: BitcoinStore, cudosStore: CudosStore, nftRepo: NftRepo, collectionRepo: CollectionRepo, miningFarmRepo: MiningFarmRepo) {
        this.bitcoinStore = bitcoinStore;
        this.cudosStore = cudosStore;

        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.extendedChartState = new ExtendedChartState(this.fetchStatistics);
        this.gridViewState = new GridViewState(this.fetch, 3, 4, 2);

        this.resetDefaults();

        makeAutoObservable(this);
    }

    resetDefaults() {
        this.cudosPrice = S.NOT_EXISTS;
        this.bitcoinPrice = S.NOT_EXISTS;
        this.nftEntity = null;
        this.collectionEntity = null;
        this.miningFarm = null;
        this.nftEntities = null;
    }

    async init(nftId: string) {
        await this.bitcoinStore.init();
        await this.cudosStore.init();

        this.nftEntity = await this.nftRepo.fetchNftById(nftId);

        this.collectionEntity = await this.collectionRepo.fetchCollectionById(this.nftEntity.collectionId);
        this.miningFarm = await this.miningFarmRepo.fetchMiningFarmById(this.collectionEntity.farmId);

        await this.fetch();

        this.cudosPrice = this.cudosStore.getCudosPrice();
        this.bitcoinPrice = this.bitcoinStore.getBitcoinPrice();
    }

    fetch = async () => {
        const nftFilterModel = new NftFilterModel();
        nftFilterModel.collectionIds = [this.nftEntity.collectionId];
        nftFilterModel.from = this.gridViewState.getFrom();
        nftFilterModel.count = this.gridViewState.getItemsPerPage();
        const { nftEntities, total } = (await this.nftRepo.fetchNftsByFilter(nftFilterModel));

        runInAction(() => {
            this.nftEntities = nftEntities;
            this.gridViewState.setTotalItems(total);
            this.extendedChartState.init();
        });
    }

    // TODO: get from repo
    fetchStatistics = async (timestamp: number): Promise < number[] > => {
        return [100, 232, 24, 51, 46, 43, 234, 534, 34, 56, 34, 53, 235, 532, 2, 353, 323, 100, 232, 24, 51, 46, 43, 234, 534, 34, 56, 34, 53, 235, 532, 2, 353, 323];
    }

    getNftPriceText() {
        if (this.isNftListed() === false) {
            return 'Not for sale';
        }

        return `${this.nftEntity.price.multipliedBy(this.cudosPrice).toFixed(2)}`;
    }

    isNftListed() {
        return this.nftEntity.listingStatus === NftListinStatus.LISTED;
    }

    isOwner(address: string) {
        return this.nftEntity.currentOwnerAddress === address;
    }
}
