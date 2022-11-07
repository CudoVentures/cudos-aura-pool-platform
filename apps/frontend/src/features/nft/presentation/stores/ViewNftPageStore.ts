import S from '../../../../core/utilities/Main';
import { makeAutoObservable, runInAction } from 'mobx';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftEntity from '../../entities/NftEntity';
import CollectionEntity, { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import MiningFarmEntity, { MiningFarmStatus } from '../../../mining-farm/entities/MiningFarmEntity';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import NftFilterModel from '../../utilities/NftFilterModel';
import GridViewState from '../../../../core/presentation/stores/GridViewState';
import StatisticsRepo from '../../../analytics/presentation/repos/StatisticsRepo';
import NftEarningsEntity from '../../../analytics/entities/NftEarningsEntity';
import DefaultIntervalPickerState from '../../../analytics/presentation/stores/DefaultIntervalPickerState';
import TableState from '../../../../core/presentation/stores/TableState';
import NftEventEntity from '../../../analytics/entities/NftEventEntity';
import NftEventFilterModel from '../../../analytics/entities/NftEventFilterModel';

enum StatsTabs {
    EARNINGS = 0,
    INFO = 1,
    HISTORY = 2,
}

export default class ViewNftPageStore {

    bitcoinStore: BitcoinStore;
    cudosStore: CudosStore;

    nftRepo: NftRepo;
    collectionRepo: CollectionRepo;
    miningFarmRepo: MiningFarmRepo;
    statisticsRepo: StatisticsRepo;

    cudosPrice: number;
    bitcoinPrice: number;
    statsTab: StatsTabs;

    nftEntity: NftEntity;
    collectionEntity: CollectionEntity;
    miningFarmEntity: MiningFarmEntity;
    nftEntities: NftEntity[];
    gridViewState: GridViewState;

    defaultIntervalPickerState: DefaultIntervalPickerState;
    nftEarningsEntity: NftEarningsEntity;

    nftEventFilterModel: NftEventFilterModel;
    nftEventEntities: NftEventEntity[];
    historyTableState: TableState;

    constructor(bitcoinStore: BitcoinStore, cudosStore: CudosStore, nftRepo: NftRepo, collectionRepo: CollectionRepo, miningFarmRepo: MiningFarmRepo, statisticsRepo: StatisticsRepo) {
        this.bitcoinStore = bitcoinStore;
        this.cudosStore = cudosStore;

        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;
        this.miningFarmRepo = miningFarmRepo;
        this.statisticsRepo = statisticsRepo;

        this.cudosPrice = S.NOT_EXISTS;
        this.bitcoinPrice = S.NOT_EXISTS;
        this.statsTab = StatsTabs.EARNINGS;

        this.nftEntity = null;
        this.collectionEntity = null;
        this.miningFarmEntity = null;
        this.nftEntities = null;
        this.gridViewState = new GridViewState(this.fetchNftsInTheCollection, 3, 4, 2);

        this.defaultIntervalPickerState = new DefaultIntervalPickerState(this.fetchEarnings);
        this.nftEarningsEntity = null;

        this.nftEventFilterModel = new NftEventFilterModel();
        this.nftEventEntities = null;
        this.historyTableState = new TableState(0, [], this.fetchHistory, 10);

        makeAutoObservable(this);
    }

    async init(nftId: string) {
        await this.bitcoinStore.init();
        await this.cudosStore.init();

        this.cudosPrice = this.cudosStore.getCudosPriceInUsd();
        this.bitcoinPrice = this.bitcoinStore.getBitcoinPriceInUsd();

        this.nftEntity = await this.nftRepo.fetchNftById(nftId, CollectionStatus.ANY);
        this.collectionEntity = await this.collectionRepo.fetchCollectionById(this.nftEntity.collectionId, CollectionStatus.ANY);
        this.miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmById(this.collectionEntity.farmId, MiningFarmStatus.ANY);

        this.nftEventFilterModel.nftId = this.nftEntity.id;

        await this.fetchNftsInTheCollection();
        await this.fetchEarnings();
        await this.fetchHistory();
    }

    fetchNftsInTheCollection = async () => {
        const nftFilterModel = new NftFilterModel();
        nftFilterModel.collectionIds = [this.nftEntity.collectionId];
        nftFilterModel.from = this.gridViewState.getFrom();
        nftFilterModel.count = this.gridViewState.getItemsPerPage();
        const { nftEntities, total } = (await this.nftRepo.fetchNftsByFilter(nftFilterModel));

        runInAction(() => {
            this.nftEntities = nftEntities;
            this.gridViewState.setTotalItems(total);
        });
    }

    fetchEarnings = async () => {
        this.nftEarningsEntity = await this.statisticsRepo.fetchNftEarningsByNftId(this.nftEntity.id, this.defaultIntervalPickerState.earningsTimestampFrom, this.defaultIntervalPickerState.earningsTimestampTo);
    }

    fetchHistory = async () => {
        this.nftEventFilterModel.from = this.historyTableState.tableFilterState.from;
        this.nftEventFilterModel.count = this.historyTableState.tableFilterState.itemsPerPage;
        const { nftEventEntities, total } = await this.statisticsRepo.fetchNftEvents(this.nftEventFilterModel);

        runInAction(() => {
            this.nftEventEntities = nftEventEntities;
            this.historyTableState.tableFilterState.total = total;
        });
    }

    isTabEarnings(): boolean {
        return this.statsTab === StatsTabs.EARNINGS;
    }

    isTabInfo(): boolean {
        return this.statsTab === StatsTabs.INFO;
    }

    isTabHistory(): boolean {
        return this.statsTab === StatsTabs.HISTORY;
    }

    onChangeTabEarnings = () => {
        this.statsTab = StatsTabs.EARNINGS;
    }

    onChangeTabInfo = () => {
        this.statsTab = StatsTabs.INFO;
    }

    onChangeTabHistory = () => {
        this.statsTab = StatsTabs.HISTORY;
    }

    getNftPriceText() {
        if (this.nftEntity.isStatusListed() === false) {
            return 'Not for sale';
        }

        return this.cudosStore.formatConvertedAcudosInUsd(this.nftEntity.priceInAcudos);
    }

}
