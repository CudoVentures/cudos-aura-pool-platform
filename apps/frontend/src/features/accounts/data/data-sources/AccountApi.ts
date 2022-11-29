import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import axios, { decodeStorageToken, setTokenInStorage } from '../../../../core/utilities/AxiosWrapper';
import { ReqLogin, ReqRegister } from '../dto/Requests';
import { ResFetchSessionAccounts, ResLogin } from '../dto/Responses';
import { StdSignature } from 'cudosjs';

export default class AccountApi {

    async login(username: string, password: string, cudosWalletAddress: string, walletName: string, signedTx: StdSignature | null, sequence: number, accountNumber: number): Promise < void > {
        const { data } = await axios.post('/api/v1/auth/login', new ReqLogin(username, password, cudosWalletAddress, walletName, signedTx, sequence, accountNumber));
        const res = new ResLogin(data);

        setTokenInStorage(res.accessToken);
    }

    async register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: StdSignature, sequence: number, accountNumber: number): Promise < void > {
        await axios.post('/api/v1/auth/register', new ReqRegister(email, password, cudosWalletAddress, name, signedTx, sequence, accountNumber));
    }

    async logout(): Promise < void > {
        setTokenInStorage(null);
    }

    async confirmBitcoinAddress(bitcoinAddress: string, accountId: string): Promise < void > {
        const data = axios.put(`/api/v1/user/${accountId}`, {
            payout_address: bitcoinAddress,
        });

        // TODO: uncomment when backend returns token
        // setTokenInStorage(data.access_token);
    }

    async creditAccount(accountEntity: AccountEntity): Promise < void > {

        const data = axios.put(`/api/v1/user/${accountEntity.accountId}`, AccountEntity.toJson(accountEntity));

        // TODO: uncomment when backend returns token
        // setTokenInStorage(data.access_token);
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
        const { data } = await axios.get('/api/v1/auth/fetchSessionAccounts');
        const res = new ResFetchSessionAccounts(data);

        return {
            accountEntity: res.accountEntity,
            userEntity: res.userEntity,
            adminEntity: res.adminEntity,
            superAdminEntity: res.superAdminEntity,
        }

        // console.log(user);
        // if (user === '') {
        //     user = null;
        // }

        // if (user) {
        //     user.email_verified = S.INT_TRUE;
        //     user.active = S.INT_TRUE;
        //     user.timestamp_last_login = Date.now();
        //     user.role = user.role === 'farm_admin' ? AccountType.ADMIN : AccountType.SUPER_ADMIN;

        //     user.admin_id = user.id;
        //     user.super_admin_id = user.id;
        //     user.account_id = user.id;
        // }

        // return {
        //     accountEntity: AccountEntity.fromJson(user),
        //     userEntity: UserEntity.fromJson(null),
        //     adminEntity: user && user.role === AccountType.ADMIN ? AdminEntity.fromJson(user) : null,
        //     superAdminEntity: user && user.role === AccountType.SUPER_ADMIN ? SuperAdminEntity.fromJson(user) : null,
        // }
    }

    async creditAdminSettings(adminEntity: AdminEntity, accountEntity: AccountEntity): Promise < void > {

        // const data = ...
        // setTokenInStorage(data.access_token);
        return null;
    }
}
