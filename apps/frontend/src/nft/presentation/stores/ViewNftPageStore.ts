import S from '../../../core/utilities/Main';
import { makeAutoObservable } from 'mobx';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import NftEntity from '../../entities/NftEntity';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import MiningFarmEntity from '../../../mining-farm/entities/MiningFarmEntity';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import NftFilterModel from '../../utilities/NftFilterModel';
import GridViewState from '../../../core/presentation/stores/GridViewState';
import StatisticsRepo from '../../../analytics/presentation/repos/StatisticsRepo';
import NftEarningsEntity from '../../../analytics/entities/NftEarningsEntity';
import DefaultIntervalPickerState from '../../../analytics/presentation/stores/DefaultIntervalPickerState';
import TableState from '../../../core/presentation/stores/TableState';
import NftEventEntity, { NftEventType } from '../../../analytics/entities/NftEventEntity';
import NftEventFilterModel from '../../../analytics/entities/NftEventFilterModel';
import BigNumber from 'bignumber.js';
import AccountRepo from '../../../accounts/presentation/repos/AccountRepo';
import AdminEntity from '../../../accounts/entities/AdminEntity';
import GeneralStore from '../../../general/presentation/stores/GeneralStore';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import PresaleStore from '../../../app-routes/presentation/PresaleStore';
import { formatBtc } from '../../../core/utilities/NumberFormatter';

enum StatsTabs {
    EARNINGS = 0,
    INFO = 1,
    HISTORY = 2,
}

export default class ViewNftPageStore {

    bitcoinStore: BitcoinStore;
    cudosStore: CudosStore;
    generalStore: GeneralStore;
    accountSessionStore: AccountSessionStore;
    presaleStore: PresaleStore;

    nftRepo: NftRepo;
    collectionRepo: CollectionRepo;
    miningFarmRepo: MiningFarmRepo;
    statisticsRepo: StatisticsRepo;
    accountRepo: AccountRepo;

    cudosPrice: number;
    bitcoinPrice: number;
    statsTab: StatsTabs;

    nftEntity: NftEntity;
    collectionEntity: CollectionEntity;
    miningFarmEntity: MiningFarmEntity;
    adminEntity: AdminEntity;
    nftEntities: NftEntity[];
    gridViewState: GridViewState;

    defaultIntervalPickerState: DefaultIntervalPickerState;
    nftEarningsEntity: NftEarningsEntity;

    nftEventFilterModel: NftEventFilterModel;
    nftEventEntities: NftEventEntity[];
    historyTableState: TableState;

    constructor(bitcoinStore: BitcoinStore, cudosStore: CudosStore, generalStore: GeneralStore, accountSessionStore: AccountSessionStore, presaleStore: PresaleStore, nftRepo: NftRepo, collectionRepo: CollectionRepo, miningFarmRepo: MiningFarmRepo, statisticsRepo: StatisticsRepo, accountRepo: AccountRepo) {
        this.bitcoinStore = bitcoinStore;
        this.cudosStore = cudosStore;
        this.generalStore = generalStore;
        this.accountSessionStore = accountSessionStore;
        this.presaleStore = presaleStore;

        this.nftRepo = nftRepo;
        this.collectionRepo = collectionRepo;
        this.miningFarmRepo = miningFarmRepo;
        this.statisticsRepo = statisticsRepo;
        this.accountRepo = accountRepo;

        this.cudosPrice = S.NOT_EXISTS;
        this.bitcoinPrice = S.NOT_EXISTS;
        this.statsTab = StatsTabs.EARNINGS;

        this.nftEntity = null;
        this.collectionEntity = null;
        this.miningFarmEntity = null;
        this.adminEntity = null;
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
        await runInActionAsync(() => {
            this.cudosPrice = S.NOT_EXISTS;
            this.bitcoinPrice = S.NOT_EXISTS;
            this.nftEntity = null;
            this.collectionEntity = null;
            this.miningFarmEntity = null;
            this.adminEntity = null;
            this.nftEntities = null;
            this.nftEarningsEntity = null;
            this.nftEventEntities = null;
            this.nftEventFilterModel.nftId = S.Strings.NOT_EXISTS;
        });

        const nftEntity = await this.nftRepo.fetchNftById(nftId);
        const collectionEntity = await this.collectionRepo.fetchCollectionById(nftEntity.collectionId);

        const [adminEntity, miningFarmEntity] = await Promise.all([
            this.accountRepo.fetchFarmOwnerAccount(nftEntity.creatorId),
            this.miningFarmRepo.fetchMiningFarmById(collectionEntity.farmId),
            this.bitcoinStore.init(),
            this.cudosStore.init(),
            this.generalStore.init(),
        ]);

        await runInActionAsync(() => {
            this.cudosPrice = this.cudosStore.getCudosPriceInUsd()
            this.bitcoinPrice = this.bitcoinStore.getBitcoinPriceInUsd()
            this.nftEntity = nftEntity
            this.adminEntity = adminEntity;
            this.collectionEntity = collectionEntity;
            this.miningFarmEntity = miningFarmEntity;
            this.nftEventFilterModel.nftId = this.nftEntity.id;
        });

        await Promise.all([
            this.fetchNftsInTheCollection(),
            this.fetchEarnings(),
            this.fetchHistory(),
        ])
    }

    hasAccess(): boolean {
        if (this.accountSessionStore.isSuperAdmin() === true) {
            return true;
        }

        if (this.accountSessionStore.isAdmin() === true) {
            return this.accountSessionStore.adminEntity.accountId === this.adminEntity.accountId;
        }

        return this.collectionEntity?.isStatusApproved() === true && this.miningFarmEntity?.isApproved() === true;
    }

    fetchNftsInTheCollection = async () => {
        let nftEntities, total;

        if (this.presaleStore.isInPresale() === false) {
            const nftFilterModel = new NftFilterModel();
            nftFilterModel.collectionIds = [this.nftEntity.collectionId];
            nftFilterModel.from = this.gridViewState.getFrom();
            nftFilterModel.count = this.gridViewState.getItemsPerPage();
            const fetchedNfts = await this.nftRepo.fetchNftsByFilter(nftFilterModel);
            nftEntities = fetchedNfts.nftEntities;
            total = fetchedNfts.total;
        } else {
            nftEntities = [];
            total = 0;
        }

        await runInActionAsync(() => {
            this.nftEntities = nftEntities;
            this.gridViewState.setTotalItems(total);
        });
    }

    fetchEarnings = async () => {
        const nftEarningsEntity = await this.statisticsRepo.fetchNftEarningsByNftId(this.nftEntity.id, this.defaultIntervalPickerState.earningsTimestampFrom, this.defaultIntervalPickerState.earningsTimestampTo);
        await runInActionAsync(() => {
            this.nftEarningsEntity = nftEarningsEntity;
        });
    }

    fetchHistory = async () => {
        this.nftEventFilterModel.from = this.historyTableState.tableFilterState.from;
        this.nftEventFilterModel.count = this.historyTableState.tableFilterState.itemsPerPage;
        this.nftEventFilterModel.eventTypes = [NftEventType.SALE, NftEventType.TRANSFER]
        const { nftEventEntities, total } = await this.statisticsRepo.fetchNftEvents(this.nftEventFilterModel);

        await runInActionAsync(() => {
            this.nftEventEntities = nftEventEntities;
            this.historyTableState.tableFilterState.setTotal(total);
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

    formatNftPriceInUsd() {
        if (this.nftEntity.isStatusListed() === false) {
            return 'Not for sale';
        }

        return this.cudosStore.formatPriceInUsdForNft(this.nftEntity);
    }

    getMonthlyMaintenanceFee(): BigNumber {
        if (this.nftEntity === null || this.miningFarmEntity === null) {
            return new BigNumber(0);
        }

        const k = new BigNumber(this.nftEntity.hashPowerInTh / this.miningFarmEntity.hashPowerInTh);
        return this.miningFarmEntity.maintenanceFeeInBtc.multipliedBy(k);
    }

    calculateGrossProfitPerDay(): BigNumber {
        if (this.nftEntity === null || this.collectionEntity === null || this.miningFarmEntity === null) {
            return new BigNumber(0);
        }

        return this.bitcoinStore.calculateRewardsPerDay(this.nftEntity.hashPowerInTh);
    }

    calculateGrossProfitPerWeek(): BigNumber {
        if (this.nftEntity === null || this.collectionEntity === null || this.miningFarmEntity === null) {
            return new BigNumber(0);
        }

        return this.bitcoinStore.calculateRewardsPerWeek(this.nftEntity.hashPowerInTh);
    }

    calculateGrossProfitPerMonth(): BigNumber {
        if (this.nftEntity === null || this.collectionEntity === null || this.miningFarmEntity === null) {
            return new BigNumber(0);
        }

        return this.bitcoinStore.calculateRewardsPerMonth(this.nftEntity.hashPowerInTh);
    }

    calculateGrossProfitPerYear(): BigNumber {
        if (this.nftEntity === null || this.collectionEntity === null || this.miningFarmEntity === null) {
            return new BigNumber(0);
        }

        return this.bitcoinStore.calculateRewardsPerYear(this.nftEntity.hashPowerInTh);
    }

    calculateNetProfitPerDay(): BigNumber {
        if (this.miningFarmEntity === null) {
            return new BigNumber(0);
        }

        const maintenanceFee = this.getMonthlyMaintenanceFee().multipliedBy(new BigNumber(1 / 30));
        const grossProfit = this.calculateGrossProfitPerDay()
        let profit = grossProfit.multipliedBy(this.generalStore.getPercentRemainderAfterCudosFee()).minus(maintenanceFee);

        if (profit.lt(new BigNumber(0)) === true) {
            profit = new BigNumber(0);
        }

        return profit;
    }

    calculateNetProfitPerWeek(): BigNumber {
        if (this.miningFarmEntity === null) {
            return new BigNumber(0);
        }

        const maintenanceFee = this.getMonthlyMaintenanceFee().multipliedBy(new BigNumber(7 * (1 / 30)));
        const grossProfit = this.calculateGrossProfitPerWeek();
        let profit = grossProfit.multipliedBy(this.generalStore.getPercentRemainderAfterCudosFee()).minus(maintenanceFee);

        if (profit.lt(new BigNumber(0)) === true) {
            profit = new BigNumber(0);
        }

        return profit;
    }

    calculateNetProfitPerMonth(): BigNumber {
        if (this.miningFarmEntity === null) {
            return new BigNumber(0);
        }

        const maintenanceFee = this.getMonthlyMaintenanceFee();
        const grossProfit = this.calculateGrossProfitPerMonth();
        let profit = grossProfit.multipliedBy(this.generalStore.getPercentRemainderAfterCudosFee()).minus(maintenanceFee);

        if (profit.lt(new BigNumber(0)) === true) {
            profit = new BigNumber(0);
        }

        return profit;
    }

    calculateNetProfitPerYear(): BigNumber {
        if (this.miningFarmEntity === null) {
            return new BigNumber(0);
        }

        const maintenanceFee = this.getMonthlyMaintenanceFee().multipliedBy(new BigNumber(12));
        const grossProfit = this.calculateGrossProfitPerYear();
        let profit = grossProfit.multipliedBy(this.generalStore.getPercentRemainderAfterCudosFee()).minus(maintenanceFee);

        if (profit.lt(new BigNumber(0)) === true) {
            profit = new BigNumber(0);
        }

        return profit;
    }

    formatNetProfitPerDay(): string {
        return formatBtc(this.calculateNetProfitPerDay(), true);
    }

    formatNetProfitPerWeek(): string {
        return formatBtc(this.calculateNetProfitPerWeek(), true);
    }

    formatNetProfitPerMonth(): string {
        return formatBtc(this.calculateNetProfitPerMonth(), true);
    }

    formatNetProfitPerYear(): string {
        return formatBtc(this.calculateNetProfitPerYear(), true);
    }

    formatMontlyMaintenanceFee(): string {
        return formatBtc(this.getMonthlyMaintenanceFee(), true);
    }

}
