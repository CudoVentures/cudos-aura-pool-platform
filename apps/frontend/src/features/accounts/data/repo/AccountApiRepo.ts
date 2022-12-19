import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import AccountRepo from '../../presentation/repos/AccountRepo';
import AccountApi from '../data-sources/AccountApi';
import { GasPrice, StargateClient, StdSignature } from 'cudosjs';
import { ADDRESSBOOK_LABEL, ADDRESSBOOK_NETWORK, CHAIN_DETAILS } from '../../../../core/utilities/Constants';
import { CudosSigningStargateClient } from 'cudosjs/build/stargate/cudos-signingstargateclient';
import { BackendErrorType, parseBackendErrorType } from '../../../../core/utilities/AxiosWrapper';
import S from '../../../../core/utilities/Main';

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

    async login(username: string, password: string, cudosWalletAddress: string, bitcoinPayoutWalletAddress: string, walletName: string, signedTx: StdSignature | null, sequence: number, accountNumber: number): Promise < void > {
        try {
            this.disableActions?.();
            return await this.accountApi.login(username, password, cudosWalletAddress, bitcoinPayoutWalletAddress, walletName, signedTx, sequence, accountNumber);
        } catch (e) {
            switch (parseBackendErrorType(e)) {
                case BackendErrorType.WRONG_USER_OR_PASSWORD:
                    this.showAlert?.('Wrong credentials');
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
            Object.assign(accountEntity, resultAccountEntity);
        } finally {
            this.enableActions?.();
        }
    }

    async editSessionSuperAdmin(superAdminEntity: SuperAdminEntity): Promise < void > {
        try {
            this.disableActions?.();
            const resultSuperAdminEntity = await this.accountApi.editSessionSuperAdmin(superAdminEntity);
            Object.assign(superAdminEntity, resultSuperAdminEntity);
        } finally {
            this.enableActions?.();
        }
    }

    async editSessionAccountPass(oldPassword: string, newPassword: string, token: string): Promise < void > {
        try {
            this.disableActions?.();
            return this.accountApi.editSessionAccountPass(oldPassword, newPassword, token);
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
            return this.accountApi.forgottenPassword(email);
        } finally {
            this.enableActions?.();
        }
    }

    async sendSessionAccountVerificationEmail(): Promise < void > {
        try {
            this.disableActions?.();
            return this.accountApi.sendSessionAccountVerificationEmail();
        } finally {
            this.enableActions?.();
        }
    }

    async confirmBitcoinAddress(client: CudosSigningStargateClient, cudosWalletAddress: string, bitcoinAddress: string): Promise < boolean > {
        try {
            this.disableActions?.();

            const gasPrice = GasPrice.fromString(`${CHAIN_DETAILS.GAS_PRICE}${CHAIN_DETAILS.NATIVE_TOKEN_DENOM}`);
            await client.addressbookCreateAddress(cudosWalletAddress, ADDRESSBOOK_NETWORK, ADDRESSBOOK_LABEL, bitcoinAddress, gasPrice);
            return true;
        } catch (ex) {
            return false;
        } finally {
            this.enableActions?.();
        }
    }

    async fetchAddressCudosBalance(cudosAddress: string): Promise < string > {
        try {
            const cudosClient = await StargateClient.connect(CHAIN_DETAILS.RPC_ADDRESS);
            const res = await cudosClient.getBalance(cudosAddress, CHAIN_DETAILS.NATIVE_TOKEN_DENOM);

            return res.amount;
        } catch (e) {
            return S.Strings.NOT_EXISTS;
        }
    }

    async fetchBitcoinAddress(cudosAddress: string): Promise < string > {
        try {
            const cudosClient = await StargateClient.connect(CHAIN_DETAILS.RPC_ADDRESS);
            const res = await cudosClient.addressbookModule.getAddress(cudosAddress, ADDRESSBOOK_NETWORK, ADDRESSBOOK_LABEL);

            return res.address.value
        } catch (e) {
            return S.Strings.EMPTY;
        }
    }

    async fetchFarmOwnerAccount(accountId: string): Promise < AdminEntity > {
        try {
            this.disableActions?.();
            return this.accountApi.fetchFarmOwnerAccount(accountId);
        } finally {
            this.enableActions?.();
        }
    }

}
