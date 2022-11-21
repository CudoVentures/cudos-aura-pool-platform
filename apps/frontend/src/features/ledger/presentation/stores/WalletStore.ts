import { action, makeAutoObservable, makeObservable, observable } from 'mobx';
import { KeplrWallet, Ledger, CosmostationWallet } from 'cudosjs';
import S from '../../../../core/utilities/Main';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';
import BigNumber from 'bignumber.js';
import AlertStore from '../../../../core/presentation/stores/AlertStore';

declare let Config;

export const SESSION_STORAGE_WALLET_KEY = 'auraPoolConnectedWallet';

export enum SessionStorageWalletOptions {
    KEPLR = 'keplr',
    COSMOSTATION = 'cosmostation',
}

export default class WalletStore {
    alertStore: AlertStore;

    selectedNetwork: string;

    ledger: Ledger;
    balance: BigNumber;
    address: string;
    name: string;

    constructor(alertStore: AlertStore) {
        this.alertStore = alertStore;

        this.selectedNetwork = CHAIN_DETAILS.DEFAULT_NETWORK;

        this.ledger = null;
        this.balance = null;
        this.address = S.Strings.EMPTY;
        this.name = S.Strings.EMPTY;

        makeAutoObservable(this);
    }

    @action
    public async connectKeplr(): Promise<void> {
        this.ledger = new KeplrWallet({
            CHAIN_ID: CHAIN_DETAILS.CHAIN_ID[this.selectedNetwork],
            CHAIN_NAME: CHAIN_DETAILS.CHAIN_NAME[this.selectedNetwork],
            RPC: CHAIN_DETAILS.RPC_ADDRESS[this.selectedNetwork],
            API: CHAIN_DETAILS.API_ADDRESS[this.selectedNetwork],
            STAKING: CHAIN_DETAILS.STAKING_URL[this.selectedNetwork],
            GAS_PRICE: CHAIN_DETAILS.GAS_PRICE.toString(),
        });
        await this.connectLedger(SessionStorageWalletOptions.KEPLR);
    }

    @action
    public async connectCosmostation(): Promise < void > {
        this.ledger = new CosmostationWallet({
            CHAIN_ID: CHAIN_DETAILS.CHAIN_ID[this.selectedNetwork],
            CHAIN_NAME: CHAIN_DETAILS.CHAIN_NAME[this.selectedNetwork],
            RPC: CHAIN_DETAILS.RPC_ADDRESS[this.selectedNetwork],
            API: CHAIN_DETAILS.API_ADDRESS[this.selectedNetwork],
            STAKING: CHAIN_DETAILS.STAKING_URL[this.selectedNetwork],
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

            this.address = this.ledger.accountAddress;
            this.name = await this.ledger.getName();
            this.loadBalance(); // to not wait for it
        } catch (ex) {
            this.alertStore.show(ex.message)
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

    public async tryConnect(walletType: SessionStorageWalletOptions): Promise < void > {
        switch (walletType) {
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
        if (this.ledger !== null) {
            return this.ledger.isConnected();
        }

        // TO DO: Cosmostation

        return false;
    }

    private async loadBalance(): Promise < void > {
        try {
            if (this.ledger !== null) {
                this.balance = await this.ledger.getBalance();
                return;
            }

            // TO DO: Cosmostation

            this.balance = new BigNumber(0);
        } catch (ex) {
            this.balance = new BigNumber(0);
        }
    }

    // onClickToggleKeplr = async () => {
    //     if (this.isKeplrConnected() === true) {
    //         await this.disconnectKeplr();
    //     } else {
    //         await this.connectKeplr();
    //     }
    // }

    onChangeAccount = () => {
        window.location.reload();
    }

    // async getSignerData() {
    //     const signer = this.ledger.offlineSigner;
    //     const sender = this.ledger.accountAddress;
    //     const client = await SigningStargateClient.connectWithSigner(Config.CUDOS_NETWORK.RPC, signer);

    //     return { signer, sender, client };
    // }

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
}
