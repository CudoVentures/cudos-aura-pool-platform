import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { makeAutoObservable } from 'mobx';
import CudosRepo from '../../../cudos-data/presentation/repos/CudosRepo';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import AccountSessionStore from './AccountSessionStore';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';

export default class MegaWalletBalanceStore {

    cudosRepo: CudosRepo;
    accountSessionStore: AccountSessionStore;

    superAdminWalletBalanceInAcudos: BigNumber;

    constructor(cudosRepo: CudosRepo, accountSessionStore: AccountSessionStore) {
        this.cudosRepo = cudosRepo;
        this.accountSessionStore = accountSessionStore;
        makeAutoObservable(this);
    }

    async fetchWalletBalance() {
        const superAdminWalletBalanceInAcudos = await this.cudosRepo.fetchAcudosBalance(this.accountSessionStore.superAdminEntity.cudosRoyalteesAddress);

        await runInActionAsync(() => {
            this.superAdminWalletBalanceInAcudos = superAdminWalletBalanceInAcudos
        })
    }

    getSuperAdminBalanceInAcudos(): BigNumber {
        return this.superAdminWalletBalanceInAcudos ?? new BigNumber(0);
    }

    formatSuperAdminBalance(): string {
        return numeral(CudosStore.convertAcudosInCudos(this.getSuperAdminBalanceInAcudos()).toString(10)).format('0,0.000000');
    }

}
