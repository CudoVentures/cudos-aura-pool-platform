import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';
import { StdSignature } from 'cudosjs';

import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import MiningFarmRepo from '../../../mining-farm/presentation/repos/MiningFarmRepo';
import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import AccountRepo from '../repos/AccountRepo';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import KycStore from '../../../kyc/presentation/stores/KycStore';
import CudosRepo from '../../../cudos-data/presentation/repos/CudosRepo';

export default class AccountSessionStore {

    walletStore: WalletStore;
    kycStore: KycStore;
    accountRepo: AccountRepo;
    miningFarmRepo: MiningFarmRepo;
    cudosRepo: CudosRepo;

    inited: boolean;
    approvedMiningFarm: boolean;
    accountEntity: AccountEntity;
    userEntity: UserEntity;
    adminEntity: AdminEntity;
    superAdminEntity: SuperAdminEntity;
    shouldChangePassword: number;

    constructor(walletStore: WalletStore, kycStore: KycStore, accountRepo: AccountRepo, miningFarmRepo: MiningFarmRepo, cudosRepo: CudosRepo) {
        this.walletStore = walletStore;
        this.kycStore = kycStore;
        this.accountRepo = accountRepo;
        this.miningFarmRepo = miningFarmRepo;
        this.cudosRepo = cudosRepo;

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

    isUserAndWalletConnected() {
        return this.isUser() === true && this.walletStore.isConnected() === true;
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

    isAccountActive(): boolean {
        return this.accountEntity?.isActive() || false;
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

    // async shouldUserRegisterBtcAddress(): Promise<boolean> {
    //     if (this.isUser() === false) {
    //         return false;
    //     }

    //     return await this.hasBitcoinPayoutWalletAddress() === false;
    // }

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
        this.kycStore.nullKycOnLogout();

        await runInActionAsync(() => {
            this.accountEntity = null;
            this.userEntity = null;
            this.adminEntity = null;
            this.superAdminEntity = null;
        })
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

        await runInActionAsync(() => {
            Object.assign(this.accountEntity, accountEntity);
        });
    }

    async editSessionSuperAdmin(superAdminEntity: SuperAdminEntity) {
        await this.accountRepo.editSessionSuperAdmin(superAdminEntity)

        await runInActionAsync(() => {
            Object.assign(this.superAdminEntity, superAdminEntity);
        });
    }

    async hasBitcoinPayoutWalletAddress(): Promise < boolean > {
        const btcAddress = await this.fetchUserBitcoinPayoutWalletAddress();

        return btcAddress !== '';
    }

    async fetchUserBitcoinPayoutWalletAddress(): Promise < string > {
        return this.cudosRepo.fetchBitcoinPayoutAddress(this.userEntity.cudosWalletAddress);
    }

    async loadSessionAccountsAndSync() {
        const { accountEntity, userEntity, adminEntity, superAdminEntity, shouldChangePassword } = await this.accountRepo.fetchSessionAccounts();

        const promises = [];
        if (accountEntity?.isUser() === true && userEntity !== null) {

            await this.walletStore.tryConnect();

            if (this.walletStore.isConnected() === true) {
                if (userEntity.cudosWalletAddress !== this.walletStore.getAddress()) {
                    await this.walletStore.disconnect();
                    // return;
                }
            }

            // console.log('Logged as user => wallet:', this.walletStore.isConnected())
        } else if (accountEntity?.isAdmin() === true && adminEntity !== null) {
            await this.walletStore.tryConnect();

            if (this.walletStore.isConnected() === true) {
                if (adminEntity.cudosWalletAddress !== this.walletStore.getAddress()) {
                    await this.walletStore.disconnect();
                    // return;
                }
            }

            promises.push(this.loadAdminMiningFarmApproval());

            // console.log('Logged as admin => wallet:', this.walletStore.isConnected())
        } else if (accountEntity?.isSuperAdmin() === true && superAdminEntity !== null) {
            await this.walletStore.tryConnect();

            if (this.walletStore.isConnected() === true) {
                // if (adminEntity.cudosWalletAddress !== this.walletStore.getAddress()) {
                //     await this.walletStore.disconnect();
                //     return;
                // }
            }

            // console.log('Logged as super => wallet:', this.walletStore.isConnected())
        }

        promises.push(this.kycStore.fetchKyc());

        await Promise.all(promises);
        await runInActionAsync(() => {
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

        await runInActionAsync(() => {
            this.approvedMiningFarm = miningFarmEntity?.isApproved() ?? false;
        })
    }

    isInited(): boolean {
        return this.inited;
    }
}
