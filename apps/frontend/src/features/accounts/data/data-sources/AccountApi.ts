import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import axios, { setTokenInStorage } from '../../../../core/utilities/AxiosWrapper';
import { ReqEditSessionAccount, ReqEditSessionAccountPass, ReqEditSuperAdminAccount, ReqForgottenPassword, ReqLogin, ReqRegister } from '../dto/Requests';
import { ResEditSessionAccount, ResEditSuperAdminAccount, ResFetchSessionAccounts, ResLogin } from '../dto/Responses';
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

    async fetchSessionAccounts(): Promise < { accountEntity: AccountEntity, userEntity: UserEntity, adminEntity: AdminEntity, superAdminEntity: SuperAdminEntity, shouldChangePassword: number } > {
        const { data } = await axios.get('/api/v1/auth/fetchSessionAccounts');
        const res = new ResFetchSessionAccounts(data);

        return {
            accountEntity: res.accountEntity,
            userEntity: res.userEntity,
            adminEntity: res.adminEntity,
            superAdminEntity: res.superAdminEntity,
            shouldChangePassword: res.shouldChangePassword,
        }
    }

    async editSessionAccount(accountEntity: AccountEntity): Promise < AccountEntity > {
        const { data } = await axios.post('/api/v1/accounts/editSessionAccount', new ReqEditSessionAccount(AccountEntity.toJson(accountEntity)));
        const res = new ResEditSessionAccount(data);
        return res.accountEntity;
    }

    async editSuperAdminAccount(accountEntity: AccountEntity, superAdminEntity: SuperAdminEntity): Promise < SuperAdminEntity > {
        const { data } = await axios.post('/api/v1/accounts/editSuperAdminAccount', new ReqEditSuperAdminAccount(accountEntity, superAdminEntity));
        const res = new ResEditSuperAdminAccount(data);
        return res.superAdminEntity;
    }

    async editSessionAccountPass(oldPassword: string, newPassword: string, token: string): Promise < void > {
        await axios.patch('/api/v1/accounts/editSessionAccountPass', new ReqEditSessionAccountPass(oldPassword, newPassword, token));
    }

    async forgottenPassword(email: string): Promise < void > {
        await axios.patch('/api/v1/accounts/forgottenPassword', new ReqForgottenPassword(email));
    }

    async sendSessionAccountVerificationEmail(): Promise < void > {
        await axios.patch('/api/v1/accounts/sendSessionAccountVerificationEmail');
    }

    async fetchAccountsByAccountId(accountId: string): Promise < { accountEntity: AccountEntity, userEntity: UserEntity, adminEntity: AdminEntity, superAdminEntity: SuperAdminEntity } > {
        const { data } = await axios.get(`/api/v1/accounts/${accountId}`);
        const res = new ResFetchSessionAccounts(data);

        return {
            accountEntity: res.accountEntity,
            userEntity: res.userEntity,
            adminEntity: res.adminEntity,
            superAdminEntity: res.superAdminEntity,
        }
    }
}
