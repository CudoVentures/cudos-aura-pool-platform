import S from '../../../../core/utilities/Main';
import StorageHelper from '../../../../core/helpers/StorageHelper';
import AccountEntity, { AccountType } from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import AccountRepo from '../../presentation/repos/AccountRepo';
import Ledger from 'cudosjs/build/ledgers/Ledger';
import { StdSignature } from 'cudosjs';

export default class AccountStorageRepo implements AccountRepo {

    storageHelper: StorageHelper;

    constructor(storageHelper: StorageHelper) {
        this.storageHelper = storageHelper;
    }

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void) {}
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void) {}

    async login(email: string, password: string, cudosWalletAddress: string, bitcoinPayoutWalletAddress: string, walletName: string, signedTx: StdSignature | null, sequence: number, accountNumber: number): Promise < void > {
        const currentAccounts = this.storageHelper.accountsJson;
        const currentUsers = this.storageHelper.usersJson;
        const currentAdmins = this.storageHelper.adminsJson;
        const currentSuperAdmins = this.storageHelper.superAdminsJson;

        let adminJson = null;
        let superAdminJson = null;
        let userJson = null;
        let accountJson = null;

        // admin login
        if (email !== '' || password !== '') {
            accountJson = currentAccounts.find((json) => {
                return json.email === email;
            });

            if (accountJson === undefined) {
                throw Error('Account not found');
            }

            userJson = currentUsers.find((json) => {
                return json.accountId === accountJson.accountId;
            });
            adminJson = currentAdmins.find((json) => {
                return json.accountId === accountJson.accountId;
            });
            superAdminJson = currentSuperAdmins.find((json) => {
                return json.accountId === accountJson.accountId;
            });
        } else {
            userJson = currentUsers.find((json) => json.cudosWalletAddress === cudosWalletAddress);
            if (userJson === undefined) {
                const lastAccountEntity = currentAccounts.last();
                const nextAccountId = 1 + (lastAccountEntity !== null ? parseInt(lastAccountEntity.accountId) : 0);

                const lastUserEntity = currentUsers.last();
                const nextUserId = 1 + (lastUserEntity !== null ? parseInt(lastUserEntity.userId) : 0);
                const accountEntity = new AccountEntity();
                accountEntity.accountId = nextAccountId.toString();
                accountEntity.name = walletName;
                accountEntity.emailVerified = S.INT_TRUE;
                accountEntity.timestampLastLogin = S.NOT_EXISTS;
                accountEntity.timestampRegister = Date.now() - 100000000;

                accountJson = AccountEntity.toJson(accountEntity);
                currentAccounts.push(accountJson);

                const userEntity = new UserEntity();
                userEntity.userId = nextUserId.toString();
                userEntity.accountId = accountEntity.accountId;
                userEntity.cudosWalletAddress = cudosWalletAddress;

                userJson = UserEntity.toJson(userEntity);
                currentUsers.push(userJson);
            } else {
                accountJson = currentAccounts.find((json) => json.accountId === userJson.accountId);
            }
        }

        this.storageHelper.sessionAccount = accountJson ?? null;
        this.storageHelper.sessionUser = userJson ?? null;
        this.storageHelper.sessionAdmin = adminJson ?? null;
        this.storageHelper.sessionSuperAdmin = superAdminJson ?? null;
        this.storageHelper.save();
    }

    async register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: StdSignature, sequence: number, accountNumber: number): Promise < void > {
        const currentAccounts = this.storageHelper.accountsJson;
        const currentAdmins = this.storageHelper.adminsJson;

        const accountJson = currentAccounts.find((json) => {
            return json.email === email;
        })

        if (accountJson !== undefined) {
            throw Error('Email is aleady in use');
        }

        // account
        const lastAccountEntity = currentAccounts.last();
        const nextAccountId = 1 + (lastAccountEntity !== null ? parseInt(lastAccountEntity.accountId) : 0);

        const accountEntity = new AccountEntity();
        accountEntity.accountId = nextAccountId.toString();
        accountEntity.type = AccountType.ADMIN;
        accountEntity.emailVerified = S.INT_TRUE;
        accountEntity.name = name;
        accountEntity.email = email;
        accountEntity.timestampLastLogin = S.NOT_EXISTS;
        accountEntity.timestampRegister = Date.now() - 100000000;

        currentAccounts.push(AccountEntity.toJson(accountEntity));

        // admin
        const lastAdminEntity = currentAdmins.last();
        const nextAdminId = 1 + (lastAdminEntity !== null ? parseInt(lastAdminEntity.adminId) : 0);

        const adminEntity = new AdminEntity();
        adminEntity.adminId = nextAdminId.toString();
        adminEntity.accountId = accountEntity.accountId;
        adminEntity.cudosWalletAddress = cudosWalletAddress;

        currentAdmins.push(AdminEntity.toJson(adminEntity));

        this.storageHelper.save();
    }

    async logout(): Promise < void > {
        this.storageHelper.sessionAccount = null;
        this.storageHelper.sessionUser = null;
        this.storageHelper.sessionAdmin = null;
        this.storageHelper.sessionSuperAdmin = null;
        this.storageHelper.save();
    }

    async fetchSessionAccounts(): Promise < { accountEntity: AccountEntity; userEntity: UserEntity; adminEntity: AdminEntity; superAdminEntity: SuperAdminEntity; } > {
        return {
            accountEntity: AccountEntity.fromJson(this.storageHelper.sessionAccount),
            userEntity: UserEntity.fromJson(this.storageHelper.sessionUser),
            adminEntity: AdminEntity.fromJson(this.storageHelper.sessionAdmin),
            superAdminEntity: SuperAdminEntity.fromJson(this.storageHelper.sessionSuperAdmin),
        }
    }

    async editSessionAccount(accountEntity: AccountEntity): Promise < void > {
        const accountJson = this.storageHelper.accountsJson.find((account: AccountEntity) => account.accountId === accountEntity.accountId);
        Object.assign(accountJson, AccountEntity.toJson(accountEntity));

        this.storageHelper.sessionAccount = accountJson ?? null;
        this.storageHelper.save();
    }

    async editSessionAccountPass(oldPassword: string, newPassword: string, token: string): Promise < void > {
    }

    async forgottenPassword(email: string): Promise < void > {

    }

    async sendSessionAccountVerificationEmail(): Promise < void > {

    }

    async confirmBitcoinAddress(bitcoinAddress: string, ledger: Ledger, network: string): Promise < void > {
        const adminJson = this.storageHelper.adminsJson.find((json) => {
            return json.accountId === this.storageHelper.sessionAdmin.accountId;
        });

        this.storageHelper.sessionAdmin.bitcoinWalletAddress = bitcoinAddress;
        adminJson.bitcoinWalletAddress = bitcoinAddress;
        this.storageHelper.save();
    }

}
