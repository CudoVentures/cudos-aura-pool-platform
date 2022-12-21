import { makeAutoObservable } from 'mobx';
import TableState from '../../../../core/presentation/stores/TableState';
import S from '../../../../core/utilities/Main';
import MegaWalletEventEntity from '../../../analytics/entities/MegaWalletEventEntity';
import MegaWalletEventFilterModel from '../../../analytics/entities/MegaWalletEventFilterModel';
import NftEventEntity, { NftEventType } from '../../../analytics/entities/NftEventEntity';
import NftEventFilterModel from '../../../analytics/entities/NftEventFilterModel';
import StatisticsRepo from '../../../analytics/presentation/repos/StatisticsRepo';
import CudosRepo from '../../../cudos-data/presentation/repos/CudosRepo';
import NftEntity from '../../../nft/entities/NftEntity';
import AccountSessionStore from './AccountSessionStore';

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
        this.walletEventTableState = new TableState(0, [], this.fetchMegaWalletActivity, 10);
        this.megaWalletEventEntities = null;
        this.nftEntitiesMap = new Map<string, NftEntity>();

        makeAutoObservable(this);
    }

    async init() {
        await this.fetchMegaWalletActivity();
    }

    async fetchMegaWalletActivity() {
        const megaWalletEventFilterModel = new MegaWalletEventFilterModel();
        if (this.eventType !== S.NOT_EXISTS) {
            megaWalletEventFilterModel.eventTypes = [this.eventType];
        }
        const { megaWalletEventEntities, nftEntities } = await this.statisticsRepo.fetchMegaWalletEventEntities(megaWalletEventFilterModel);
        this.megaWalletEventEntities = megaWalletEventEntities;
        nftEntities.forEach((nftEntity) => this.nftEntitiesMap.set(nftEntity.id, nftEntity));
    }

    getNftEntity(id: string): NftEntity {
        return this.nftEntitiesMap.get(id) || null;
    }

    onChangeTableFilter = (value) => {
        this.eventType = value;

        this.fetchMegaWalletActivity();
    }
}
