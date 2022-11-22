import TableState from '../../../../core/presentation/stores/TableState';
import { makeAutoObservable } from 'mobx';
import CollectionEntity, { CollectionStatus } from '../../../collection/entities/CollectionEntity';
import CollectionFilterModel from '../../../collection/utilities/CollectionFilterModel';
import MiningFarmEntity, { MiningFarmStatus } from '../../../mining-farm/entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../../mining-farm/utilities/MiningFarmFilterModel';
import S from '../../../../core/utilities/Main';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import CollectionRepo from '../../../collection/presentation/repos/CollectionRepo';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import AccountSessionStore from './AccountSessionStore';

export default class SuperAdminApprovePageStore {
    miningFarmRepo: MiningFarmRepo;
    collectionRepo: CollectionRepo;
    walletStore: WalletStore;
    accountSessionStore: AccountSessionStore;

    miningFarmsTableState: TableState;
    collectionsTableState: TableState;

    miningFarmEntities: MiningFarmEntity[];
    collectionEntities: CollectionEntity[];

    selectedMiningFarmEntities: Map < string, MiningFarmEntity >;
    selectedCollectionEntities: Map < string, CollectionEntity >;

    constructor(miningFarmRepo: MiningFarmRepo, collectionRepo: CollectionRepo, walletStore: WalletStore, accountSessionStore: AccountSessionStore) {
        this.miningFarmRepo = miningFarmRepo;
        this.collectionRepo = collectionRepo;
        this.walletStore = walletStore;
        this.accountSessionStore = accountSessionStore;

        this.miningFarmsTableState = new TableState(0, [], this.fetchMiningFarmEntities, 50);
        this.collectionsTableState = new TableState(0, [], this.fetchCollectionEntities, 50);

        this.miningFarmEntities = [];
        this.collectionEntities = [];

        this.selectedMiningFarmEntities = new Map < string, MiningFarmEntity >();
        this.selectedCollectionEntities = new Map < string, CollectionEntity >();

        makeAutoObservable(this);
    }

    init(): void {
        this.miningFarmEntities = [];
        this.collectionEntities = [];

        this.selectedMiningFarmEntities = new Map < string, MiningFarmEntity >();
        this.selectedCollectionEntities = new Map < string, CollectionEntity >();

        this.fetch();
    }

    fetch(): void {
        this.fetchMiningFarmEntities();
        this.fetchCollectionEntities();
    }

    fetchMiningFarmEntities = (): void => {
        const miningFarmFilter = new MiningFarmFilterModel();
        miningFarmFilter.from = this.miningFarmsTableState.tableFilterState.from;
        miningFarmFilter.count = this.miningFarmsTableState.tableFilterState.itemsPerPage;
        miningFarmFilter.status = MiningFarmStatus.QUEUED;

        this.miningFarmRepo.fetchMiningFarmsByFilter(miningFarmFilter).then(({ miningFarmEntities, total }) => {
            this.miningFarmEntities = miningFarmEntities;
            this.miningFarmsTableState.tableFilterState.total = total;
        });
    }

    fetchCollectionEntities = (): void => {
        const collectionFilter = new CollectionFilterModel();
        collectionFilter.from = this.collectionsTableState.tableFilterState.from;
        collectionFilter.count = this.collectionsTableState.tableFilterState.itemsPerPage;
        collectionFilter.status = CollectionStatus.QUEUED;

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
            miningFarmEntities.push(miningFarmEntity)
        });

        await this.miningFarmRepo.approveMiningFarms(miningFarmEntities);

        this.selectedCollectionEntities.clear();

        this.fetch();
    }

    approveCollections = async () => {
        if (!this.walletStore.isConnected()) {
            this.walletStore.connectKeplr();
        }

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
                this.walletStore.selectedNetwork,
            );
        }

        this.selectedCollectionEntities.clear();

        this.fetch();
    }

}
