import { makeAutoObservable } from 'mobx';
import TableState from '../../../../core/presentation/stores/TableState';
import S from '../../../../core/utilities/Main';
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

    nftEventEntities: NftEventEntity[]
    nftEntitiesMap: Map<string, NftEntity>;

    constructor(cudosRepo: CudosRepo, statisticsRepo: StatisticsRepo, accountSessionStore: AccountSessionStore) {
        this.cudosRepo = cudosRepo;
        this.accountSessionStore = accountSessionStore;
        this.statisticsRepo = statisticsRepo;

        this.eventType = S.NOT_EXISTS;
        this.walletEventTableState = new TableState(0, [], this.fetchMegaWalletActivity, 10);
        this.nftEventEntities = null;
        this.nftEntitiesMap = new Map<string, NftEntity>();

        makeAutoObservable(this);
    }

    async init() {
        await this.fetchMegaWalletActivity();
    }

    async fetchMegaWalletActivity() {
        const nftEventsFilterModel = new NftEventFilterModel();
        if (this.eventType !== S.NOT_EXISTS) {
            nftEventsFilterModel.eventTypes = [this.eventType];
        }
        const { nftEventEntities, nftEntities } = await this.statisticsRepo.fetchNftEvents(nftEventsFilterModel);
        this.nftEventEntities = nftEventEntities;
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
