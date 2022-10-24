import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';

export default class AccountApi {

    async login(username: string, password: string, cudosWalletAddress: string, signedTx: any): Promise < void > {
        return null;
    }

    async register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: any): Promise < void > {
        return null;
    }

    async logout(): Promise < void > {
        return null;
    }

    async confirmBitcoinAddress(): Promise < void > {
        return null;
    }

    async changePassword(token: string, accountId: string, oldPassword: string, newPassword: string): Promise < void > {
        return null;
    }

    async forgottenPassword(email: string): Promise < void > {
        return null;
    }

    async sendVerificationEmail(): Promise < void > {
        return null;
    }

    async fetchSessionAccounts(): Promise < { accountEntity: AccountEntity; userEntity: UserEntity; adminEntity: AdminEntity; superAdminEntity: SuperAdminEntity; } > {
        return null;
    }

}
