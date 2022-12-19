import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { makeAutoObservable } from 'mobx';
import TableState from '../../../../core/presentation/stores/TableState';
import S from '../../../../core/utilities/Main';
import CudosRepo from '../../../cudos-data/presentation/repos/CudosRepo';
import WalletEventEntity, { WalletEventItemType, WalletEventType } from '../../entities/WalletEventEntity';
import AccountSessionStore from './AccountSessionStore';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';

export default class SuperAdminMegaWalletPageStore {
    cudosRepo: CudosRepo;
    accountSessionStore: AccountSessionStore;

    walletEventType: {eventType: number}
    walletEventTableState: TableState;

    walletEventsEntities: WalletEventEntity[]
    superAdminWalletBalanceInAcudos: BigNumber;

    constructor(cudosRepo: CudosRepo, accountSessionStore: AccountSessionStore) {
        this.cudosRepo = cudosRepo;
        this.accountSessionStore = accountSessionStore;

        this.walletEventType = { eventType: 0 };
        this.walletEventTableState = new TableState(0, [], this.fetchMegaWalletActivity, 10);
        this.walletEventsEntities = null;
        this.superAdminWalletBalanceInAcudos = null;

        makeAutoObservable(this);
    }

    async init() {
        await this.fetchMegaWalletActivity();
        await this.fetchWalletBalance();
    }

    async fetchWalletBalance() {
        this.superAdminWalletBalanceInAcudos = await this.cudosRepo.fetchAcudosBalance(this.accountSessionStore.superAdminEntity.cudosRoyalteesAddress);
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

    getSuperAdminBalanceInAcudos(): BigNumber {
        return this.superAdminWalletBalanceInAcudos ?? new BigNumber(0);
    }

    formatSuperAdminBalance(): string {
        return numeral(CudosStore.convertAcudosInCudos(this.getSuperAdminBalanceInAcudos()).toString()).format('0,0.000000');
    }
}
