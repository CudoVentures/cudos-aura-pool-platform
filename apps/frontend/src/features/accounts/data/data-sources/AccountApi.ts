import axios from 'axios'
import AccountEntity, { AccountType } from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import JwtDecode from 'jwt-decode'

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

    async confirmBitcoinAddress(bitcoinAddress: string): Promise < void > {
        return null;
    }

    async creditAccount(accountEntity: AccountEntity): Promise < AccountEntity > {
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
        const user = localStorage.getItem('access_token') && JwtDecode(localStorage.getItem('access_token'))

        return {
            accountEntity: AccountEntity.fromJson(user ? {
                accountId: user.id,
                name: user.name,
                type: user.role === 'farm_admin' ? AccountType.ADMIN : AccountType.SUPER_ADMIN,
                email: user.email,
                emailVerified: 1,
                active: 1,
                timestampLastLogin: Date.now(),
            } : AccountEntity.fromJson({})),
            userEntity: UserEntity.fromJson(null),
            adminEntity: AdminEntity.fromJson(user && user.role === 'farm_admin' ? {
                accountId: user.id,
                adminId: user.id,
                cudosWalletAddress: user.cudos_address,
                bitcoinWalletAddress: user.payout_address,
            } : null),
            superAdminEntity: SuperAdminEntity.fromJson(user && user.role === 'super_admin' ? {
                accountId: user.id,
                adminId: user.id,
            } : null),
        }
    }

    async creditAdminSettings(adminEntity: AdminEntity, accountEntity: AccountEntity): Promise < void > {
        return null;
    }
}
