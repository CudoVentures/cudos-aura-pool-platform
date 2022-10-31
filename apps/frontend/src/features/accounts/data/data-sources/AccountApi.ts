import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import axios from 'axios'

export default class AccountApi {

    async login(username: string, password: string, cudosWalletAddress: string, signedTx: any): Promise < void > {
        const { data } = await axios.post('/api/v1/auth/login', {
            email: username,
            password,
        })

        localStorage.setItem('access_token', data.access_token)
    }

    async register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: any): Promise < void > {
        await axios.post('/api/v1/auth/register', {
            email,
            password,
            name,
            cudos_address: cudosWalletAddress,
        })
    }

    async logout(): Promise < void > {
        localStorage.removeItem('access_token')
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

    async creditAdminSettings(adminEntity: AdminEntity, accountEntity: AccountEntity): Promise < void > {
        return null;
    }
}
