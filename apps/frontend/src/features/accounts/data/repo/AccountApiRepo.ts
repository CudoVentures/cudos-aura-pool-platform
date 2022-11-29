import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import AccountRepo from '../../presentation/repos/AccountRepo';
import AccountApi from '../data-sources/AccountApi';
import { GasPrice, StargateClient, StdSignature } from 'cudosjs';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';
import { CudosSigningStargateClient } from 'cudosjs/build/stargate/cudos-signingstargateclient';

export default class AccountStorageRepo implements AccountRepo {

    accountApi: AccountApi;
    walletStore: WalletStore;
    enableActions: () => void;
    disableActions: () => void;

    constructor(walletStore: WalletStore) {
        this.walletStore = walletStore;
        this.accountApi = new AccountApi();
        this.enableActions = null;
        this.disableActions = null;
    }

    setPresentationCallbacks(enableActions: () => void, disableActions: () => void) {
        this.enableActions = enableActions;
        this.disableActions = disableActions;
    }

    async login(username: string, password: string, cudosWalletAddress: string, bitcoinPayoutWalletAddress: string, walletName: string, signedTx: StdSignature | null, sequence: number, accountNumber: number): Promise < void > {
        try {
            this.disableActions?.();
            return this.accountApi.login(username, password, cudosWalletAddress, bitcoinPayoutWalletAddress, walletName, signedTx, sequence, accountNumber);
        } finally {
            this.enableActions?.();
        }
    }

    async register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: StdSignature, sequence: number, accountNumber: number): Promise < void > {
        try {
            this.disableActions?.();
            return this.accountApi.register(email, password, name, cudosWalletAddress, signedTx, sequence, accountNumber);
        } finally {
            this.enableActions?.();
        }
    }

    async logout(): Promise < void > {
        try {
            this.disableActions?.();
            return this.accountApi.logout();
        } finally {
            this.enableActions?.();
        }
    }

    async confirmBitcoinAddress(client: CudosSigningStargateClient, cudosWalletAddress: string, bitcoinAddress: string): Promise < boolean > {
        try {
            this.disableActions?.();

            const gasPrice = GasPrice.fromString(`${CHAIN_DETAILS.GAS_PRICE}acudos`);
            await client.addressbookCreateAddress(cudosWalletAddress, 'BTC', 'aurapool', bitcoinAddress, gasPrice);
            return true;
        } catch (ex) {
            return false;
        } finally {
            this.enableActions?.();
        }
    }

    async fetchBitcoinAddress(cudosAddress: string): Promise < string > {
        try {
            const cudosClient = await StargateClient.connect(CHAIN_DETAILS.RPC_ADDRESS[CHAIN_DETAILS.DEFAULT_NETWORK]);
            const res = await cudosClient.addressbookModule.getAddress(cudosAddress, 'BTC', 'aurapool');

            return res.address.value
        } catch (e) {
            return '';
        }
    }

    async creditAccount(accountEntity: AccountEntity): Promise < void > {
        try {
            this.disableActions?.();
            const resultAccountEntity = await this.accountApi.creditAccount(accountEntity);
            Object.assign(accountEntity, resultAccountEntity);
        } finally {
            this.enableActions?.();
        }
    }

    async changePassword(oldPassword: string, newPassword: string): Promise < void > {
        try {
            this.disableActions?.();
            return this.accountApi.changePassword(oldPassword, newPassword);
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

    async sendVerificationEmail(): Promise < void > {
        try {
            this.disableActions?.();
            return this.accountApi.sendVerificationEmail();
        } finally {
            this.enableActions?.();
        }
    }

    async fetchSessionAccounts(): Promise < { accountEntity: AccountEntity; userEntity: UserEntity; adminEntity: AdminEntity; superAdminEntity: SuperAdminEntity; } > {
        try {
            this.disableActions?.();
            return this.accountApi.fetchSessionAccounts();
        } finally {
            this.enableActions?.();
        }
    }

    async creditAdminSettings(adminEntity: AdminEntity, accountEntity: AccountEntity): Promise < void > {
        try {
            this.disableActions?.();
            return this.accountApi.creditAdminSettings(adminEntity, accountEntity);
        } finally {
            this.enableActions?.();
        }
    }

}
