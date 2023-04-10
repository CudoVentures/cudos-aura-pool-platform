import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import AccountRepo from '../../presentation/repos/AccountRepo';
import AccountApi from '../data-sources/AccountApi';
import { StdSignature } from 'cudosjs';
import { BackendErrorType, parseBackendErrorType } from '../../../core/utilities/AxiosWrapper';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import AddressMintDataEntity from '../../../nft-presale/entities/AddressMintDataEntity';

export default class AccountApiRepo implements AccountRepo {

    accountApi: AccountApi;
    enableActions: () => void;
    disableActions: () => void;
    showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void;

    constructor() {
        this.accountApi = new AccountApi();
        this.enableActions = null;
        this.disableActions = null;
        this.showAlert = null;
    }

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void) {
        this.enableActions = enableActions;
        this.disableActions = disableActions;
    }

    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener: null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void) {
        this.showAlert = showAlert;
    }

    async login(username: string, password: string, cudosWalletAddress: string, walletName: string, signedTx: StdSignature | null, sequence: number, accountNumber: number): Promise < void > {
        try {
            this.disableActions?.();
            return await this.accountApi.login(username, password, cudosWalletAddress, walletName, signedTx, sequence, accountNumber);
        } catch (e) {
            switch (parseBackendErrorType(e)) {
                case BackendErrorType.WRONG_USER_OR_PASSWORD:
                    this.showAlert?.('Wrong credentials');
                    break;
                case BackendErrorType.WRONG_NONCE_SIGNATURE:
                    this.showAlert?.('Wrong nonce signature');
                    break;
                case BackendErrorType.ACCOUNT_LOCKED:
                    this.showAlert?.('You have reached the limit for unsuccessful login attempts. An email have been sent to your inbox from which you will be able to unlock you account.');
                    break;
                default:
            }
            throw Error(parseBackendErrorType(e));
        } finally {
            this.enableActions?.();
        }
    }

    async register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: StdSignature, sequence: number, accountNumber: number): Promise < void > {
        try {
            this.disableActions?.();
            return await this.accountApi.register(email, password, name, cudosWalletAddress, signedTx, sequence, accountNumber);
        } catch (e) {
            switch (parseBackendErrorType(e)) {
                case BackendErrorType.EMAIL_ALREADY_IN_USE:
                    this.showAlert?.('Email already in use');
                    break;
                case BackendErrorType.WRONG_NONCE_SIGNATURE:
                    this.showAlert?.('Wrong nonce signature');
                    break;
                default:
            }
            throw Error(parseBackendErrorType(e));
        } finally {
            this.enableActions?.();
        }
    }

    async logout(): Promise < void > {
        try {
            this.disableActions?.();
            return await this.accountApi.logout();
        } finally {
            this.enableActions?.();
        }
    }

    async fetchSessionAccounts(): Promise < { accountEntity: AccountEntity, userEntity: UserEntity, adminEntity: AdminEntity, superAdminEntity: SuperAdminEntity, shouldChangePassword: number } > {
        try {
            this.disableActions?.();
            return await this.accountApi.fetchSessionAccounts();
        } finally {
            this.enableActions?.();
        }
    }

    async editSessionAccount(accountEntity: AccountEntity): Promise < void > {
        try {
            this.disableActions?.();
            const resultAccountEntity = await this.accountApi.editSessionAccount(accountEntity);

            await runInActionAsync(() => {
                Object.assign(accountEntity, resultAccountEntity);
            })
        } finally {
            this.enableActions?.();
        }
    }

    async editSessionUser(userEntity: UserEntity): Promise < void > {
        try {
            this.disableActions?.();
            const resultUserEntity = await this.accountApi.editSessionUser(userEntity);
            await runInActionAsync(() => {
                Object.assign(userEntity, resultUserEntity);
            });
        } finally {
            this.enableActions?.();
        }
    }

    async editSessionSuperAdmin(superAdminEntity: SuperAdminEntity): Promise < void > {
        try {
            this.disableActions?.();
            const resultSuperAdminEntity = await this.accountApi.editSessionSuperAdmin(superAdminEntity);
            await runInActionAsync(() => {
                Object.assign(superAdminEntity, resultSuperAdminEntity);
            });
        } finally {
            this.enableActions?.();
        }
    }

    async editSessionAccountPass(oldPassword: string, newPassword: string, token: string): Promise < void > {
        try {
            this.disableActions?.();
            return await this.accountApi.editSessionAccountPass(oldPassword, newPassword, token);
        } catch (e) {
            switch (parseBackendErrorType(e)) {
                case BackendErrorType.WRONG_OLD_PASSWORD:
                    this.showAlert?.('Wrong old password');
                    break;
                case BackendErrorType.WRONG_VERIFICATION_TOKEN:
                    this.showAlert?.('Wrong verification token');
                    break;
                default:
            }
            throw Error(parseBackendErrorType(e));
        } finally {
            this.enableActions?.();
        }
    }

    async forgottenPassword(email: string): Promise < void > {
        try {
            this.disableActions?.();
            return await this.accountApi.forgottenPassword(email);
        } finally {
            this.enableActions?.();
        }
    }

    async sendSessionAccountVerificationEmail(): Promise < void > {
        try {
            this.disableActions?.();
            return await this.accountApi.sendSessionAccountVerificationEmail();
        } finally {
            this.enableActions?.();
        }
    }

    async fetchFarmOwnerAccount(accountId: string): Promise < AdminEntity > {
        try {
            this.disableActions?.();
            return await this.accountApi.fetchFarmOwnerAccount(accountId);
        } finally {
            this.enableActions?.();
        }
    }

    async createPresaleAccounts(addressMintDataEntities: AddressMintDataEntity[]): Promise < void > {
        try {
            this.disableActions?.();
            return await this.accountApi.createPresaleAccounts(addressMintDataEntities);
        } finally {
            this.enableActions?.();
        }
    }

}
