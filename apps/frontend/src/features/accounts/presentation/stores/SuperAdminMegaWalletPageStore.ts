import { makeAutoObservable } from 'mobx';
import TableState from '../../../../core/presentation/stores/TableState';
import S from '../../../../core/utilities/Main';
import CudosRepo from '../../../cudos-data/presentation/repos/CudosRepo';
import WalletEventEntity, { WalletEventItemType, WalletEventType } from '../../entities/WalletEventEntity';
import AccountSessionStore from './AccountSessionStore';

export default class SuperAdminMegaWalletPageStore {
    cudosRepo: CudosRepo;
    accountSessionStore: AccountSessionStore;

    walletEventType: number;
    walletEventTableState: TableState;

    walletEventsEntities: WalletEventEntity[]

    constructor(cudosRepo: CudosRepo, accountSessionStore: AccountSessionStore) {
        this.cudosRepo = cudosRepo;
        this.accountSessionStore = accountSessionStore;

        this.walletEventType = S.NOT_EXISTS;
        this.walletEventTableState = new TableState(0, [], this.fetchMegaWalletActivity, 10);
        this.walletEventsEntities = null;

        makeAutoObservable(this);
    }

    async init() {
        await this.fetchMegaWalletActivity();
    }

    async fetchMegaWalletActivity() {
        const evenJson = {
            'id': '1',
            'address': 'cudos1wegwegwegwegwegwegwegwegwegwegwegwegweg',
            'eventType': WalletEventType.FEE,
            'itemType': WalletEventItemType.NFT,
            'itemId': '1',
            'fromAddress': 'cudos1wegwegwegwegwegwegwegwegwegwegwegwegweg',
            'timestamp': 325235235235,
        }

        this.walletEventsEntities = [];
        for (let i = 0; i < 5; i++) {
            this.walletEventsEntities.push(WalletEventEntity.fromJson(evenJson));
        }
    }

    onChangeTableFilter = async () => {
        // TODO:
    }
}
