import { makeAutoObservable, runInAction } from 'mobx';
import S from '../../../../core/utilities/Main';
import { Ledger, GasPrice, SigningStargateClient } from 'cudosjs';

import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import { MiningFarmStatus } from '../../../mining-farm/entities/MiningFarmEntity';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import AccountRepo from '../repos/AccountRepo';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';

export default class AccountSessionStore {

    walletStore: WalletStore;
    accountRepo: AccountRepo;
    miningFarmRepo: MiningFarmRepo;

    inited: boolean;
    approvedMiningFarm: boolean;
    accountEntity: AccountEntity;
    userEntity: UserEntity;
    adminEntity: AdminEntity;
    superAdminEntity: SuperAdminEntity;

    constructor(walletStore: WalletStore, accountRepo: AccountRepo, miningFarmRepo: MiningFarmRepo) {
        this.walletStore = walletStore;
        this.accountRepo = accountRepo;
        this.miningFarmRepo = miningFarmRepo;

        this.inited = false;
        this.approvedMiningFarm = false;
        this.accountEntity = null;
        this.userEntity = null;
        this.adminEntity = null;
        this.superAdminEntity = null;

        makeAutoObservable(this);
    }

    isLoggedIn(): boolean {
        return this.accountEntity !== null;
    }

    isUser(): boolean {
        if (this.accountEntity === null) {
            return false;
        }

        if (this.accountEntity.isUser() === true || this.accountEntity.isAdmin() === true) {
            return this.userEntity !== null;
        }

        return false;
    }

    isAdmin(): boolean {
        if (this.accountEntity === null) {
            return false;
        }

        if (this.accountEntity.isAdmin() === true) {
            return this.adminEntity !== null;
        }

        return false;
    }

    isSuperAdmin(): boolean {
        if (this.accountEntity === null) {
            return false;
        }

        if (this.accountEntity.isSuperAdmin() === true) {
            return this.superAdminEntity !== null;
        }

        return false;
    }

    isEmailVerified(): boolean {
        return this.accountEntity?.isEmailVerified() || false;
    }

    hasApprovedMiningFarm(): boolean {
        return this.approvedMiningFarm;
    }

    async login(username: string, password: string, cudosWalletAddress: string, walletName: string, signedTx: any): Promise < void > {
        try {
            await this.accountRepo.login(username, password, cudosWalletAddress, walletName, signedTx);
        } finally {
            await this.loadSessionAccountsAndSync();
        }
    }

    async register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: any): Promise < void > {
        await this.accountRepo.register(email, password, name, cudosWalletAddress, signedTx);
    }

    async logout(): Promise < void > {
        await this.walletStore.disconnect();
        await this.accountRepo.logout();
        this.accountEntity = null;
        this.userEntity = null;
        this.adminEntity = null;
        this.superAdminEntity = null;
    }

    async confirmBitcoinAddress(bitcoinAddress: string, ledger: Ledger, network: string): Promise < void > {
        try {
            this.accountRepo.confirmBitcoinAddress(bitcoinAddress, ledger, network);
        } finally {
            await this.loadSessionAccountsAndSync();
        }
    }

    async editPassword(token: string, pass: string): Promise < void > {
        this.accountRepo.changePassword(token, '', '', pass);
    }

    async changePassword(oldPass: string, newPass: string): Promise < void > {
        await this.accountRepo.changePassword('', this.accountEntity.accountId, oldPass, newPass);
    }

    async forgottenPassword(email: string): Promise < void > {
        await this.accountRepo.forgottenPassword(email);
    }

    async sendVerificationEmail(): Promise < void > {
        await this.accountRepo.sendVerificationEmail();
    }

    async creditAccount(accountEntity: AccountEntity): Promise < void > {
        await this.accountRepo.creditAccount(accountEntity);

        runInAction(() => {
            // update session account entity
            Object.assign(this.accountEntity, accountEntity);
            // keep the account verified in the current session
            this.accountEntity.emailVerified = S.INT_TRUE;
        });
    }

    async loadSessionAccountsAndSync() {
        const { accountEntity, userEntity, adminEntity, superAdminEntity } = await this.accountRepo.fetchSessionAccounts();
        runInAction(() => {
            this.accountEntity = accountEntity;
            this.userEntity = userEntity;
            this.adminEntity = adminEntity;
            this.superAdminEntity = superAdminEntity;
        });

        if (this.isUser() === true) {
            await this.walletStore.tryConnect();

            if (this.walletStore.isConnected() === true) {
                if (this.userEntity.cudosWalletAddress !== this.walletStore.getAddress()) {
                    await this.logout();
                    window.location.reload();
                    return;
                }
            }

            console.log('Logged as user => wallet:', this.walletStore.isConnected())
        } else if (this.isAdmin() === true) {
            await this.walletStore.tryConnect();

            if (this.walletStore.isConnected() === true) {
                if (this.adminEntity.cudosWalletAddress !== this.walletStore.getAddress()) {
                    await this.logout();
                    window.location.reload();
                    return;
                }
            }

            await this.loadAdminMiningFarmApproval();

            console.log('Logged as admin => wallet:', this.walletStore.isConnected())
        } else if (this.isSuperAdmin() === true) {
            console.log('Logged as super admin => wallet:', false);
        }

        this.inited = true;
    }

    async loadAdminMiningFarmApproval(): Promise < void > {
        const miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId(MiningFarmStatus.ANY);
        this.approvedMiningFarm = miningFarmEntity?.isApproved() ?? false;
    }

    isInited(): boolean {
        return this.inited;
    }

}
