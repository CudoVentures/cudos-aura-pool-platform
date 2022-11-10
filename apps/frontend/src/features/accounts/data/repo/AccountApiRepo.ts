import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import AccountEntity from '../../entities/AccountEntity';
import AdminEntity from '../../entities/AdminEntity';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import UserEntity from '../../entities/UserEntity';
import AccountRepo from '../../presentation/repos/AccountRepo';
import AccountApi from '../data-sources/AccountApi';
import { Ledger, SigningStargateClient, GasPrice } from 'cudosjs';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';

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

    async login(username: string, password: string, cudosWalletAddress: string, signedTx: any): Promise < void > {
        try {
            this.disableActions?.();
            return this.accountApi.login(username, password, cudosWalletAddress, signedTx);
        } finally {
            this.enableActions?.();
        }
    }

    async register(email: string, password: string, name: string, cudosWalletAddress: string, signedTx: any): Promise < void > {
        try {
            this.disableActions?.();
            return this.accountApi.register(email, password, name, cudosWalletAddress, signedTx);
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

    async confirmBitcoinAddress(bitcoinAddress: string, ledger: Ledger, network: string, accountId: string): Promise < void > {
        try {
            this.disableActions?.();

            const signingClient = await SigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS[network], ledger.offlineSigner);
            const gasPrice = GasPrice.fromString(`${CHAIN_DETAILS.GAS_PRICE}acudos`);

            await signingClient.addressbookCreateAddress(ledger.accountAddress, 'BTC', 'farm', bitcoinAddress, gasPrice);
            const res = await this.accountApi.confirmBitcoinAddress(bitcoinAddress, accountId);

            return res.data.payout_address;
        } finally {
            this.enableActions?.();
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

    async changePassword(token: string, accountId: string, oldPassword: string, newPassword: string): Promise < void > {
        try {
            this.disableActions?.();
            return this.accountApi.changePassword(token, accountId, oldPassword, newPassword);
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
