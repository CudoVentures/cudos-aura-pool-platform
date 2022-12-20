import { makeAutoObservable, runInAction } from 'mobx';
import S from '../../../../core/utilities/Main';
import { StdSignature } from 'cudosjs';

import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import AccountRepo from '../repos/AccountRepo';

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
    shouldChangePassword: number;

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
        this.shouldChangePassword = S.INT_FALSE;

        makeAutoObservable(this);
    }

    isLoggedIn(): boolean {
        return this.accountEntity !== null;
    }

    isLoggedInAndWalletConnected() {
        return this.isLoggedIn() === true && this.walletStore.isConnected() === true;
    }

    isUser(): boolean {
        if (!this.accountEntity) {
            return false;
        }

        if (this.accountEntity.isUser() === true) {
            return this.userEntity !== null;
        }

        return false;
    }

    isAdmin(): boolean {
        if (!this.accountEntity) {
            return false;
        }

        if (this.accountEntity.isAdmin() === true) {
            return this.adminEntity !== null;
        }

        return false;
    }

    isSuperAdmin(): boolean {
        if (!this.accountEntity) {
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

    doesAddressMatchAgainstSessionUserIfAny(cudosWalletAddress: string): boolean {
        if (this.isUser() === true) {
            return this.userEntity.cudosWalletAddress === cudosWalletAddress;
        }

        return true;
    }

    doesAddressMatchAgainstSessionAdminIfAny(cudosWalletAddress: string): boolean {
        if (this.isAdmin() === true) {
            return this.adminEntity.cudosWalletAddress === cudosWalletAddress;
        }

        return true;
    }

    doesAddressMatchAgainstSessionAccount(cudosWalletAddress: string): boolean {
        if (this.isUser() === true) {
            return this.userEntity.cudosWalletAddress === cudosWalletAddress;
        }

        if (this.isAdmin() === true) {
            return this.adminEntity.cudosWalletAddress === cudosWalletAddress;
        }

        return false;
    }

    doesAddressMatchAgainstSessionAccountIfAny(cudosWalletAddress: string): boolean {
        if (this.isUser() === true) {
            return this.userEntity.cudosWalletAddress === cudosWalletAddress;
        }

        if (this.isAdmin() === true) {
            return this.adminEntity.cudosWalletAddress === cudosWalletAddress;
        }

        return true;
    }

    hasApprovedMiningFarm(): boolean {
        return this.approvedMiningFarm;
    }

    shouldUpdatePassword(): boolean {
        return this.shouldChangePassword === S.INT_TRUE;
    }

    async loginWithCredentials(username: string, password: string) {
        await this.login(username, password, '', '', null, S.NOT_EXISTS, S.NOT_EXISTS);
    }

    async loginWithWallet(cudosWalletAddress: string, walletName: string, signedTx: StdSignature, sequence: number, accountNumber: number) {
        await this.login('', '', cudosWalletAddress, walletName, signedTx, sequence, accountNumber);
    }

    async login(username: string, password: string, cudosWalletAddress: string, walletName: string, signedTx: StdSignature | null, sequence: number, accountNumber: number): Promise < void > {
        try {
            await this.accountRepo.login(username, password, cudosWalletAddress, walletName, signedTx, sequence, accountNumber);
        } finally {
            await this.loadSessionAccountsAndSync();
        }
    }

    async register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: StdSignature, sequence: number, accountNumber: number): Promise < void > {
        await this.accountRepo.register(email, password, name, cudosWalletAddress, signedTx, sequence, accountNumber);
    }

    async logout(): Promise < void > {
        await this.walletStore.disconnect();
        await this.accountRepo.logout();
        this.accountEntity = null;
        this.userEntity = null;
        this.adminEntity = null;
        this.superAdminEntity = null;
    }

    async editPassword(token: string, pass: string): Promise < void > {
        this.accountRepo.editSessionAccountPass('', pass, token);
    }

    async changePassword(oldPass: string, newPass: string): Promise < void > {
        await this.accountRepo.editSessionAccountPass(oldPass, newPass, '');
    }

    async forgottenPassword(email: string): Promise < void > {
        await this.accountRepo.forgottenPassword(email);
    }

    async sendVerificationEmail(): Promise < void > {
        await this.accountRepo.sendSessionAccountVerificationEmail();
    }

    async editSessionAccount(accountEntity: AccountEntity): Promise < void > {
        await this.accountRepo.editSessionAccount(accountEntity);

        runInAction(() => {
            Object.assign(this.accountEntity, accountEntity);
        });
    }

    async editSessionSuperAdmin(superAdminEntity: SuperAdminEntity) {
        await this.accountRepo.editSessionSuperAdmin(superAdminEntity)

        runInAction(() => {
            Object.assign(this.superAdminEntity, superAdminEntity);
        });
    }

    async loadSessionAccountsAndSync() {
        const { accountEntity, userEntity, adminEntity, superAdminEntity, shouldChangePassword } = await this.accountRepo.fetchSessionAccounts();

        if (accountEntity?.isUser() === true && userEntity !== null) {
            await this.walletStore.tryConnect();

            if (this.walletStore.isConnected() === true) {
                if (userEntity.cudosWalletAddress !== this.walletStore.getAddress()) {
                    await this.walletStore.disconnect();
                    return;
                }
            }

            console.log('Logged as user => wallet:', this.walletStore.isConnected())
        } else if (accountEntity?.isAdmin() === true && adminEntity !== null) {
            await this.walletStore.tryConnect();

            if (this.walletStore.isConnected() === true) {
                if (adminEntity.cudosWalletAddress !== this.walletStore.getAddress()) {
                    await this.walletStore.disconnect();
                    return;
                }
            }

            await this.loadAdminMiningFarmApproval();

            console.log('Logged as admin => wallet:', this.walletStore.isConnected())
        } else if (accountEntity?.isSuperAdmin() === true && superAdminEntity !== null) {
            await this.walletStore.tryConnect();

            if (this.walletStore.isConnected() === true) {
                // if (adminEntity.cudosWalletAddress !== this.walletStore.getAddress()) {
                //     await this.walletStore.disconnect();
                //     return;
                // }
            }

            console.log('Logged as super => wallet:', this.walletStore.isConnected())
        }

        runInAction(() => {
            this.accountEntity = accountEntity;
            this.userEntity = userEntity;
            this.adminEntity = adminEntity;
            this.superAdminEntity = superAdminEntity;
            this.shouldChangePassword = shouldChangePassword;
            this.inited = true;
        });
    }

    async loadAdminMiningFarmApproval(): Promise < void > {
        const miningFarmEntity = await this.miningFarmRepo.fetchMiningFarmBySessionAccountId();
        this.approvedMiningFarm = miningFarmEntity?.isApproved() ?? false;
    }

    isInited(): boolean {
        return this.inited;
    }

}
