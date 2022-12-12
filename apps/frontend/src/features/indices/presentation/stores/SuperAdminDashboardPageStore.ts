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
    miningFarmsTableState: TableState;
    collectionsTableState: TableState;
    defaultIntervalPickerState: DefaultIntervalPickerState;

    topPerformingFarms: MiningFarmEntity[];
    topPerformingFarmsDetailsMap: Map<string, MiningFarmDetailsEntity>;
    miningFarmEntities: MiningFarmEntity[];
    collectionEntities: CollectionEntity[];

    selectedMiningFarmEntities: Map < string, MiningFarmEntity >;
    selectedCollectionEntities: Map < string, CollectionEntity >;

    constructor(miningFarmRepo: MiningFarmRepo, collectionRepo: CollectionRepo, walletStore: WalletStore, accountSessionStore: AccountSessionStore, alertStore: AlertStore) {
        this.miningFarmRepo = miningFarmRepo;
        this.collectionRepo = collectionRepo;
        this.walletStore = walletStore;
        this.accountSessionStore = accountSessionStore;
        this.alertStore = alertStore;

        this.defaultIntervalPickerState = new DefaultIntervalPickerState(() => this.fetchTopPerformingFarmEntities);
        this.topFarmsTableState = new TableState(0, [], this.fetchTopPerformingFarmEntities, 5);
        this.miningFarmsTableState = new TableState(0, [], this.fetchMiningFarmEntities, 50);
        this.collectionsTableState = new TableState(0, [], this.fetchCollectionEntities, 50);

        this.topPerformingFarms = null;
        this.miningFarmEntities = [];
        this.collectionEntities = [];

        this.topPerformingFarmsDetailsMap = new Map<string, MiningFarmDetailsEntity>();
        this.selectedMiningFarmEntities = new Map < string, MiningFarmEntity >();
        this.selectedCollectionEntities = new Map < string, CollectionEntity >();

        makeAutoObservable(this);
    }

    init(): void {
        this.topPerformingFarms = null;
        this.miningFarmEntities = [];
        this.collectionEntities = [];

        this.topPerformingFarmsDetailsMap = new Map<string, MiningFarmDetailsEntity>();
        this.selectedMiningFarmEntities = new Map < string, MiningFarmEntity >();
        this.selectedCollectionEntities = new Map < string, CollectionEntity >();

        this.fetch();
    }

    fetch(): void {
        this.fetchTopPerformingFarmEntities();
        this.fetchMiningFarmEntities();
        this.fetchCollectionEntities();
    }

    fetchTopPerformingFarmEntities = async (): Promise<void> => {
        const miningFarmFilter = new MiningFarmFilterModel();
        miningFarmFilter.from = this.topFarmsTableState.tableFilterState.from;
        miningFarmFilter.count = this.topFarmsTableState.tableFilterState.itemsPerPage;
        miningFarmFilter.status = [MiningFarmStatus.APPROVED];
        miningFarmFilter.orderBy = MiningFarmOrderBy.ERFORMANCE_DESC;

        const { miningFarmEntities, total } = await this.miningFarmRepo.fetchMiningFarmsByFilter(miningFarmFilter);
        const miningFarmDetails = await this.miningFarmRepo.fetchMiningFarmsDetailsByIds(miningFarmEntities.map((entity) => entity.id));

        runInAction(() => {
            this.topPerformingFarms = miningFarmEntities;
            this.topFarmsTableState.tableFilterState.total = total;
            miningFarmDetails.forEach((entity) => {
                this.topPerformingFarmsDetailsMap.set(entity.miningFarmId, entity);
            })
        })
    }

    fetchMiningFarmEntities = (): void => {
        const miningFarmFilter = new MiningFarmFilterModel();
        miningFarmFilter.from = this.miningFarmsTableState.tableFilterState.from;
        miningFarmFilter.count = this.miningFarmsTableState.tableFilterState.itemsPerPage;
        miningFarmFilter.status = [MiningFarmStatus.QUEUED];

        this.miningFarmRepo.fetchMiningFarmsByFilter(miningFarmFilter).then(({ miningFarmEntities, total }) => {
            this.miningFarmEntities = miningFarmEntities;
            this.miningFarmsTableState.tableFilterState.total = total;
        });
    }

    fetchCollectionEntities = (): void => {
        const collectionFilter = new CollectionFilterModel();
        collectionFilter.from = this.collectionsTableState.tableFilterState.from;
        collectionFilter.count = this.collectionsTableState.tableFilterState.itemsPerPage;
        collectionFilter.status = [CollectionStatus.QUEUED];

        this.collectionRepo.fetchCollectionsByFilter(collectionFilter).then(({ collectionEntities, total }) => {
            this.collectionEntities = collectionEntities;
            this.collectionsTableState.tableFilterState.total = total;
        });
    }

    isMiningFarmEntitySelected(miningFarmId: string): number {
        return this.selectedMiningFarmEntities.has(miningFarmId) ? S.INT_TRUE : S.INT_FALSE;
    }

    isCollectionEntitySelected(collectionId: string): number {
        return this.selectedCollectionEntities.has(collectionId) ? S.INT_TRUE : S.INT_FALSE;
    }

    toggleMiningFarmSelection(miningFarmId: string) {
        if (this.selectedMiningFarmEntities.has(miningFarmId)) {
            this.selectedMiningFarmEntities.delete(miningFarmId);
        } else {
            const miningFarmEntity = this.miningFarmEntities.find((entity: MiningFarmEntity) => { return entity.id === miningFarmId });
            this.selectedMiningFarmEntities.set(miningFarmId, miningFarmEntity);
        }
    }

    toggleCollectionSelection(collectionId: string) {
        if (this.selectedCollectionEntities.has(collectionId)) {
            this.selectedCollectionEntities.delete(collectionId);
        } else {
            const collectionEntity = this.collectionEntities.find((entity: CollectionEntity) => { return entity.id === collectionId });
            this.selectedCollectionEntities.set(collectionId, collectionEntity);
        }
    }

    approveMiningFarms = async () => {
        const miningFarmEntities = [];

        this.selectedMiningFarmEntities.forEach((miningFarmEntity) => {
            miningFarmEntity.markApproved();

            // if royalties not custom set for this farm, set the super admin standard onss
            if (miningFarmEntity.isCudosMintNftRoyaltiesPercentSet() === false) {
                miningFarmEntity.cudosMintNftRoyaltiesPercent = this.accountSessionStore.superAdminEntity.firstSaleCudosRoyaltiesPercent;
            }

            if (miningFarmEntity.isCudosResaleNftRoyaltiesPercentSet() === false) {
                miningFarmEntity.cudosResaleNftRoyaltiesPercent = this.accountSessionStore.superAdminEntity.resaleCudosRoyaltiesPercent;
            }

            miningFarmEntities.push(miningFarmEntity)
        });

        await this.miningFarmRepo.creditMiningFarms(miningFarmEntities);

        this.selectedMiningFarmEntities = new Map();

        this.fetch();
    }

    approveCollections = async () => {
        if (this.walletStore.isConnected() === false) {
            this.alertStore.show('You must connect your wallet first');
            return;
        }

        try {
            const collectionEntities = [];

            this.selectedCollectionEntities.forEach((collectionEntity) => {
                collectionEntity.markApproved();
                collectionEntities.push(collectionEntity);
            });

            for (let i = collectionEntities.length; i-- > 0;) {
                await this.collectionRepo.approveCollection(
                    collectionEntities[i],
                    this.accountSessionStore.superAdminEntity,
                    this.walletStore.ledger,
                );
            }

            this.selectedCollectionEntities.clear();

            this.fetch();
        } catch (e) {
            this.alertStore.show(e.message);
        }
    }

    getMiningFarmDetails(id: string): MiningFarmDetailsEntity {
        return this.topPerformingFarmsDetailsMap.get(id) ?? null;
    }
}
