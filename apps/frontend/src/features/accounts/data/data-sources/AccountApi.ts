import AccountEntity, { AccountType } from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import axios, { decodeStorageToken, setTokenInStorage } from '../../../../core/utilities/AxiosWrapper';

export default class AccountApi {

    async login(username: string, password: string, cudosWalletAddress: string, signedTx: any): Promise < void > {
        const { data } = await axios.post('/api/v1/auth/login', {
            email: username,
            password,
        })

        setTokenInStorage(data.access_token);
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
        setTokenInStorage(null);
    }

    async confirmBitcoinAddress(bitcoinAddress: string, accountId: string): Promise < void > {
        const data = axios.put(`/api/v1/user/${accountId}`, {
            payout_address: bitcoinAddress,
        });

        // setTokenInStorage(data.access_token);
    }

    async creditAccount(accountEntity: AccountEntity): Promise < AccountEntity > {

        // const data = ...
        // setTokenInStorage(data.access_token);
        return null;
    }

    async changePassword(oldPassword: string, newPassword: string): Promise < void > {
        const user = decodeStorageToken();

        const data = await axios.patch(`/api/v1/user/${user.id}/password`, {
            old_password: oldPassword,
            password: newPassword,
        });
    }

    async forgottenPassword(email: string): Promise < void > {
        return null;
    }

    async sendVerificationEmail(): Promise < void > {
        return null;
    }

    async fetchSessionAccounts(): Promise < { accountEntity: AccountEntity; userEntity: UserEntity; adminEntity: AdminEntity; superAdminEntity: SuperAdminEntity; } > {
        const user = decodeStorageToken();
        if (user) {
            user.email_verified = 1;
            user.active = 1;
            user.timestamp_last_login = Date.now();
            user.role = user.role === 'farm_admin' ? AccountType.ADMIN : AccountType.SUPER_ADMIN;

            user.admin_id = user.id;
            user.super_admin_id = user.id;
            user.account_id = user.id;
        }
        return {
            accountEntity: AccountEntity.fromJson(user),
            userEntity: UserEntity.fromJson(null),
            adminEntity: user && user.role === AccountType.ADMIN ? AdminEntity.fromJson(user) : null,
            superAdminEntity: user && user.role === AccountType.SUPER_ADMIN ? SuperAdminEntity.fromJson(user) : null,
        }
    }

    async creditAdminSettings(adminEntity: AdminEntity, accountEntity: AccountEntity): Promise < void > {

        // const data = ...
        // setTokenInStorage(data.access_token);
        return null;
    }
}
