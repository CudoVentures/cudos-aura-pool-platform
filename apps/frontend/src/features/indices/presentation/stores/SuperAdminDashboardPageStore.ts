import TableState from '../../../../core/presentation/stores/TableState';
import { makeAutoObservable, runInAction } from 'mobx';
import CollectionEntity, { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import CollectionFilterModel from '../../../collection/utilities/CollectionFilterModel';
import MiningFarmEntity, { MiningFarmStatus } from '../../../mining-farm/entities/MiningFarmEntity';
import MiningFarmFilterModel, { MiningFarmOrderBy } from '../../../mining-farm/utilities/MiningFarmFilterModel';
import S from '../../../../core/utilities/Main';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import MiningFarmDetailsEntity from '../../../mining-farm/entities/MiningFarmDetailsEntity';
import DefaultIntervalPickerState from '../../../analytics/presentation/stores/DefaultIntervalPickerState';

export default class SuperAdminDashboardPageStore {
    miningFarmRepo: MiningFarmRepo;
    collectionRepo: CollectionRepo;
    walletStore: WalletStore;
    accountSessionStore: AccountSessionStore;
    alertStore: AlertStore;

    topFarmsTableState: TableState;
    defaultIntervalPickerState: DefaultIntervalPickerState;

    topPerformingFarms: MiningFarmEntity[];
    topPerformingFarmsDetailsMap: Map<string, MiningFarmDetailsEntity>;

    constructor(miningFarmRepo: MiningFarmRepo, collectionRepo: CollectionRepo, walletStore: WalletStore, accountSessionStore: AccountSessionStore, alertStore: AlertStore) {
        this.miningFarmRepo = miningFarmRepo;
        this.collectionRepo = collectionRepo;
        this.walletStore = walletStore;
        this.accountSessionStore = accountSessionStore;
        this.alertStore = alertStore;

        this.defaultIntervalPickerState = new DefaultIntervalPickerState(this.fetchTopPerformingFarmEntities);
        this.topFarmsTableState = new TableState(0, [], this.fetchTopPerformingFarmEntities, 5);

        this.topPerformingFarms = null;

        this.topPerformingFarmsDetailsMap = new Map<string, MiningFarmDetailsEntity>();

        makeAutoObservable(this);
    }

    init(): void {
        this.topPerformingFarms = null;
        this.topPerformingFarmsDetailsMap = new Map<string, MiningFarmDetailsEntity>();

        this.fetch();
    }

    fetch(): void {
        this.fetchTopPerformingFarmEntities();
    }

    fetchTopPerformingFarmEntities = async (): Promise<void> => {
        const miningFarmFilter = new MiningFarmFilterModel();
        miningFarmFilter.from = this.topFarmsTableState.tableFilterState.from;
        miningFarmFilter.count = this.topFarmsTableState.tableFilterState.itemsPerPage;
        miningFarmFilter.status = [MiningFarmStatus.APPROVED];
        miningFarmFilter.orderBy = MiningFarmOrderBy.ERFORMANCE_DESC;

        const { miningFarmEntities, total } = await this.miningFarmRepo.fetchMiningFarmsByFilter(miningFarmFilter);
        const miningFarmDetails = await this.miningFarmRepo.fetchMiningFarmsDetailsByIds(miningFarmEntities.map((entity) => entity.id));

        console.log(miningFarmEntities);

        runInAction(() => {
            this.topPerformingFarms = miningFarmEntities;
            this.topFarmsTableState.tableFilterState.total = total;
            miningFarmDetails.forEach((entity) => {
                this.topPerformingFarmsDetailsMap.set(entity.miningFarmId, entity);
            })
        })
    }

    getMiningFarmDetails(id: string): MiningFarmDetailsEntity {
        return this.topPerformingFarmsDetailsMap.get(id) ?? null;
    }
}
