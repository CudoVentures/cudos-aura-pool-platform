import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import AccountRepo from '../../presentation/repos/AccountRepo';
import AccountApi from '../data-sources/AccountApi';

export default class AccountStorageRepo implements AccountRepo {

    accountApi: AccountApi;

    constructor() {
        this.accountApi = new AccountApi();
    }

    async login(username: string, password: string, cudosWalletAddress: string, signedTx: any): Promise < void > {
        return this.accountApi.login(username, password, cudosWalletAddress, signedTx);
    }

    async register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: any): Promise < void > {
        return this.accountApi.register(email, password, name, cudosWalletAddress, signedTx);
    }

    async logout(): Promise < void > {
        return this.accountApi.logout();
    }

    async confirmBitcoinAddress(): Promise < void > {
        return this.accountApi.confirmBitcoinAddress();
    }

    async changePassword(token: string, accountId: string, oldPassword: string, newPassword: string): Promise < void > {
        return this.accountApi.changePassword(token, accountId, oldPassword, newPassword);
    }

    async forgottenPassword(email: string): Promise < void > {
        return this.accountApi.forgottenPassword(email);
    }

    async sendVerificationEmail(): Promise < void > {
        return this.accountApi.sendVerificationEmail();
    }

    async fetchSessionAccounts(): Promise < { accountEntity: AccountEntity; userEntity: UserEntity; adminEntity: AdminEntity; superAdminEntity: SuperAdminEntity; } > {
        return this.accountApi.fetchSessionAccounts();
    }

    async creditAdminSettings(adminEntity: AdminEntity, accountEntity: AccountEntity): Promise < void > {
        return this.accountApi.creditAdminSettings(adminEntity, accountEntity);
    }
}
