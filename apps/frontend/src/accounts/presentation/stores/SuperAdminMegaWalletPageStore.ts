import { makeAutoObservable } from 'mobx';
import TableState from '../../../core/presentation/stores/TableState';
import S from '../../../core/utilities/Main';
import MegaWalletEventEntity from '../../../analytics/entities/MegaWalletEventEntity';
import MegaWalletEventFilterModel, { MegaWalletEventSortBY } from '../../../analytics/entities/MegaWalletEventFilterModel';
import { NftEventType } from '../../../analytics/entities/NftEventEntity';
import StatisticsRepo from '../../../analytics/presentation/repos/StatisticsRepo';
import CudosRepo from '../../../cudos-data/presentation/repos/CudosRepo';
import NftEntity from '../../../nft/entities/NftEntity';
import AccountSessionStore from './AccountSessionStore';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';

export default class SuperAdminMegaWalletPageStore {
    cudosRepo: CudosRepo;
    statisticsRepo: StatisticsRepo;
    accountSessionStore: AccountSessionStore;

    eventType: NftEventType;
    walletEventTableState: TableState;

    megaWalletEventEntities: MegaWalletEventEntity[]
    nftEntitiesMap: Map<string, NftEntity>;

    constructor(cudosRepo: CudosRepo, statisticsRepo: StatisticsRepo, accountSessionStore: AccountSessionStore) {
        this.cudosRepo = cudosRepo;
        this.accountSessionStore = accountSessionStore;
        this.statisticsRepo = statisticsRepo;

        this.eventType = S.NOT_EXISTS;
        this.walletEventTableState = new TableState(MegaWalletEventSortBY.TIME_DESC, [[MegaWalletEventSortBY.TIME_ASC, 4]], this.fetchMegaWalletActivity, 10);
        this.megaWalletEventEntities = null;
        this.nftEntitiesMap = new Map<string, NftEntity>();

        makeAutoObservable(this);
    }

    async init() {
        await this.fetchMegaWalletActivity();
    }

    fetchMegaWalletActivity = async () => {
        const megaWalletEventFilterModel = new MegaWalletEventFilterModel();
        if (this.eventType !== S.NOT_EXISTS) {
            megaWalletEventFilterModel.eventTypes = [this.eventType];
        }
        megaWalletEventFilterModel.count = this.walletEventTableState.tableFilterState.itemsPerPage;
        megaWalletEventFilterModel.from = this.walletEventTableState.tableFilterState.from;
        megaWalletEventFilterModel.sortBy = this.walletEventTableState.tableFilterState.sortKey;
        const { megaWalletEventEntities, nftEntities, total } = await this.statisticsRepo.fetchMegaWalletEventEntities(megaWalletEventFilterModel);

        await runInActionAsync(() => {
            nftEntities.forEach((nftEntity) => this.nftEntitiesMap.set(nftEntity.id, nftEntity));
            this.walletEventTableState.tableFilterState.setTotal(total);
            this.megaWalletEventEntities = megaWalletEventEntities;
        })
    }

    getNftEntity(id: string): NftEntity {
        return this.nftEntitiesMap.get(id) || null;
    }

    onChangeTableFilter = async (value) => {
        this.eventType = value;
        await this.fetchMegaWalletActivity();
    }
}
