import S from '../../../../core/utilities/Main';
import BigNumber from 'bignumber.js';
import StorageHelper from '../../../../core/helpers/StorageHelper';
import AccountEntity, { AccountType } from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import AccountRepo from '../../presentation/repos/AccountRepo';
import MiningFarmEntity, { MiningFarmStatus } from '../../../mining-farm/entities/MiningFarmEntity';

export default class AccountStorageRepo implements AccountRepo {

    storageHelper: StorageHelper;

    constructor(storageHelper: StorageHelper) {
        this.storageHelper = storageHelper;
    }

    async login(email: string, password: string, cudosWalletAddress: string, signedTx: any): Promise < void > {
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
                accountEntity.emailVerified = S.INT_TRUE;
                accountEntity.timestampLastLogin = S.NOT_EXISTS;
                accountEntity.timestampRegister = Date.now() - 100000000;

                accountJson = AccountEntity.toJson(accountEntity);
                currentAccounts.push(accountJson);

                const userEntity = new UserEntity();
                userEntity.userId = nextUserId.toString();
                userEntity.accountId = accountEntity.accountId;
                userEntity.cudosWalletAddress = cudosWalletAddress;
                userEntity.totalBtcEarned = new BigNumber(0);
                userEntity.totalHashPower = 0;

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

    async register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: any): Promise < void > {
        const currentAccounts = this.storageHelper.accountsJson;
        const currentAdmins = this.storageHelper.adminsJson;
        const currentMiningFarms = this.storageHelper.miningFarmsJson;

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

        // mining farm
        const lastMiningFarmEntity = currentMiningFarms.last();
        const nextMiningFarmId = 1 + (lastMiningFarmEntity !== null ? parseInt(lastMiningFarmEntity.id) : 0);

        const miningFarmEntity = new MiningFarmEntity();
        miningFarmEntity.id = nextMiningFarmId.toString();
        miningFarmEntity.accountId = accountEntity.accountId;

        currentMiningFarms.push(MiningFarmEntity.toJson(miningFarmEntity));

        this.storageHelper.save();
    }

    async logout(): Promise < void > {
        this.storageHelper.sessionAccount = null;
        this.storageHelper.sessionUser = null;
        this.storageHelper.sessionAdmin = null;
        this.storageHelper.sessionSuperAdmin = null;
        this.storageHelper.save();
    }

    async confirmBitcoinAddress(): Promise < void > {
        const adminJson = this.storageHelper.adminsJson.find((json) => {
            return json.accountId === this.storageHelper.sessionAdmin.accountId;
        });

        this.storageHelper.sessionAdmin.bitcoinWalletAddress = 'bc2qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
        adminJson.bitcoinWalletAddress = 'bc2qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
        this.storageHelper.save();
    }

    async changePassword(username: string, token: string, newPassword: string, newPasswordRepeat: string): Promise < void > {
        // TODO
    }

    async fetchSessionAccounts(): Promise < { accountEntity: AccountEntity; userEntity: UserEntity; adminEntity: AdminEntity; superAdminEntity: SuperAdminEntity; } > {
        return {
            accountEntity: AccountEntity.fromJson(this.storageHelper.sessionAccount),
            userEntity: UserEntity.fromJson(this.storageHelper.sessionUser),
            adminEntity: AdminEntity.fromJson(this.storageHelper.sessionAdmin),
            superAdminEntity: SuperAdminEntity.fromJson(this.storageHelper.sessionSuperAdmin),
        }
    }

}
