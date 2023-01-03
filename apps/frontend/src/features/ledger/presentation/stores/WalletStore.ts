import { action, makeAutoObservable, makeObservable, observable, runInAction } from 'mobx';
import { KeplrWallet, Ledger, CosmostationWallet, StdSignature } from 'cudosjs';
import S from '../../../../core/utilities/Main';
import { CHAIN_DETAILS, SIGN_NONCE } from '../../../../core/utilities/Constants';
import BigNumber from 'bignumber.js';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import { CudosSigningStargateClient } from 'cudosjs/build/stargate/cudos-signingstargateclient';
import WalletRepo from '../repos/WalletRepo';

const SESSION_STORAGE_WALLET_KEY = 'auraPoolConnectedWallet';

export enum SessionStorageWalletOptions {
    KEPLR = 'keplr',
    COSMOSTATION = 'cosmostation',
}

export default class WalletStore {
    alertStore: AlertStore;
    walletRepo: WalletRepo;

    ledger: Ledger;
    balance: BigNumber;
    address: string;
    name: string;

    constructor(alertStore: AlertStore, walletRepo: WalletRepo) {
        this.alertStore = alertStore;
        this.walletRepo = walletRepo;

        this.ledger = null;
        this.balance = null;
        this.address = S.Strings.EMPTY;
        this.name = S.Strings.EMPTY;

        makeAutoObservable(this);
    }

    @action
    public async connectKeplr(): Promise<void> {
        this.ledger = new KeplrWallet({
            CHAIN_ID: CHAIN_DETAILS.CHAIN_ID,
            CHAIN_NAME: CHAIN_DETAILS.CHAIN_NAME,
            RPC: CHAIN_DETAILS.RPC_ADDRESS,
            API: CHAIN_DETAILS.API_ADDRESS,
            STAKING: CHAIN_DETAILS.STAKING_URL,
            GAS_PRICE: CHAIN_DETAILS.GAS_PRICE,
        });

        await this.connectLedger(SessionStorageWalletOptions.KEPLR);
    }

    @action
    public async connectCosmostation(): Promise < void > {
        this.ledger = new CosmostationWallet({
            CHAIN_ID: CHAIN_DETAILS.CHAIN_ID,
            CHAIN_NAME: CHAIN_DETAILS.CHAIN_NAME,
            RPC: CHAIN_DETAILS.RPC_ADDRESS,
            API: CHAIN_DETAILS.API_ADDRESS,
            STAKING: CHAIN_DETAILS.STAKING_URL,
            GAS_PRICE: CHAIN_DETAILS.GAS_PRICE.toString(),
        });
        await this.connectLedger(SessionStorageWalletOptions.COSMOSTATION);
    }

    private async connectLedger(ledgerType: SessionStorageWalletOptions): Promise < void > {
        makeObservable(this.ledger, {
            'connected': observable,
            'accountAddress': observable,
            'connect': action,
        });

        this.ledger.addAddressChangeCallback(this.onChangeAccount);

        try {
            await this.ledger.connect();
            sessionStorage.setItem(SESSION_STORAGE_WALLET_KEY, ledgerType);

            const name = await this.ledger.getName();

            runInAction(() => {
                this.name = name;
                this.address = this.ledger.accountAddress;
                this.loadBalance(); // to not wait for it
            })
        } catch (ex) {
            console.log(ex);
            await this.disconnect();
        }
    }

    public async disconnect(): Promise < void > {
        if (this.ledger !== null) {
            try {
                await this.ledger.disconnect();
            } catch (ex) {
                console.error(ex);
            }
            this.ledger = null;
        }

        sessionStorage.removeItem(SESSION_STORAGE_WALLET_KEY);
    }

    public async connectWallet(sessionStorageWalletOptions: SessionStorageWalletOptions): Promise < void > {
        switch (sessionStorageWalletOptions) {
            case SessionStorageWalletOptions.KEPLR:
                await this.connectKeplr();
                break;
            case SessionStorageWalletOptions.COSMOSTATION:
                await this.connectCosmostation();
                break;
            default:
                this.alertStore.show('Unknow alert Type');
                throw Error('Unknown wallet type');
        }
    }

    public async tryConnect(): Promise < void > {
        const sessionStorageWalletOptions = sessionStorage.getItem(SESSION_STORAGE_WALLET_KEY);
        switch (sessionStorageWalletOptions) {
            case SessionStorageWalletOptions.KEPLR:
                await this.connectKeplr();
                break;
            case SessionStorageWalletOptions.COSMOSTATION:
                await this.connectCosmostation();
                break;
            default:
                break;
        }
    }

    public isConnected(): boolean {
        return this.ledger?.isConnected() ?? false;
    }

    private async loadBalance(): Promise < void > {
        try {
            const balance = await this.ledger?.getBalance() ?? new BigNumber(0);

            runInAction(() => {
                this.balance = balance;
            })
        } catch (ex) {
            runInAction(() => {
                this.balance = new BigNumber(0);
            });
        }
    }

    async getClient(): Promise < CudosSigningStargateClient > {
        return CudosSigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS, this.ledger.offlineSigner);
    }

    async signNonceMsg(): Promise < StdSignature > {
        const data = JSON.stringify({
            nonce: SIGN_NONCE,
        })

        const signature = await this.ledger.signArbitrary(
            CHAIN_DETAILS.CHAIN_ID,
            this.getAddress(),
            data,
        )

        return signature
    }

    onChangeAccount = () => {
        window.location.reload();
    }

    getBalanceSafe(): BigNumber {
        return this.balance ?? new BigNumber(0);
    }

    getAddress(): string {
        return this.address;
    }

    formatBalance(): string {
        return `${this.balance?.toFixed() ?? '0'} CUDOS`;
    }

    getName(): string {
        return this.name;
    }

    formatBalanceInCudosInt(): string {
        return this.balance?.toFixed(0) ?? '0';
    }

    formatBalanceInCudosFraction(): string {
        return this.balance?.minus(this.balance.integerValue(BigNumber.ROUND_DOWN)).shiftedBy(4).toFixed(0) ?? '0000';
    }

    sendCudos(destiantionAddress: string, amount: BigNumber): Promise<string> {
        return this.walletRepo.sendCudos(destiantionAddress, amount, this.ledger);
    }
}
