import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import axios, { decodeStorageToken, setTokenInStorage } from '../../../../core/utilities/AxiosWrapper';
import { ReqCreditSessionAccount, ReqLogin, ReqRegister } from '../dto/Requests';
import { ResCreditSessionAccount, ResFetchSessionAccounts, ResLogin } from '../dto/Responses';
import { StdSignature } from 'cudosjs';

export default class AccountApi {

    async login(username: string, password: string, cudosWalletAddress: string, bitcoinPayoutWalletAddress: string, walletName: string, signedTx: StdSignature | null, sequence: number, accountNumber: number): Promise < void > {
        const { data } = await axios.post('/api/v1/auth/login', new ReqLogin(username, password, cudosWalletAddress, bitcoinPayoutWalletAddress, walletName, signedTx, sequence, accountNumber));
        const res = new ResLogin(data);

        setTokenInStorage(res.accessToken);
    }

    async register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: StdSignature, sequence: number, accountNumber: number): Promise < void > {
        await axios.post('/api/v1/auth/register', new ReqRegister(email, password, cudosWalletAddress, name, signedTx, sequence, accountNumber));
    }

    async logout(): Promise < void > {
        setTokenInStorage(null);
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
    }

    async creditSessionAccount(accountEntity: AccountEntity): Promise < AccountEntity > {
        const { data } = await axios.post('/api/v1/accounts/creditSessionAccount', new ReqCreditSessionAccount(AccountEntity.toJson(accountEntity)));
        const res = new ResCreditSessionAccount(data);
        return res.accountEntity;
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

}
