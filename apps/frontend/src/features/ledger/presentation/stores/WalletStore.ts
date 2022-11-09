import { action, makeAutoObservable, makeObservable, observable } from 'mobx';
import { KeplrWallet } from 'cudosjs';
import S from '../../../../core/utilities/Main';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';
import BigNumber from 'bignumber.js';

declare let Config;

const SESSION_STORAGE_WALLET_KEY = 'auraPoolConnectedWallet';

enum SessionStorageWalletOptions {
    KEPLR = 'keplr',
    COSMOSTATION = 'cosmostation',
}

export default class WalletStore {

    selectedNetwork: string;

    keplrWallet: KeplrWallet;
    balance: BigNumber;
    address: string;
    name: string;

    constructor() {
        this.selectedNetwork = CHAIN_DETAILS.DEFAULT_NETWORK;

        this.keplrWallet = null;
        this.balance = null;
        this.address = S.Strings.EMPTY;
        this.name = S.Strings.EMPTY;

        makeAutoObservable(this);
    }

    @action
    public async connectKeplr(): Promise<void> {
        this.keplrWallet = new KeplrWallet({
            CHAIN_ID: CHAIN_DETAILS.CHAIN_ID[this.selectedNetwork],
            CHAIN_NAME: CHAIN_DETAILS.CHAIN_NAME[this.selectedNetwork],
            RPC: CHAIN_DETAILS.RPC_ADDRESS[this.selectedNetwork],
            API: CHAIN_DETAILS.API_ADDRESS[this.selectedNetwork],
            STAKING: CHAIN_DETAILS.STAKING_URL[this.selectedNetwork],
            GAS_PRICE: CHAIN_DETAILS.GAS_PRICE.toString(),
        });

        makeObservable(this.keplrWallet, {
            'connected': observable,
            'accountAddress': observable,
            'connect': action,
        });

        this.keplrWallet.addAddressChangeCallback(this.onChangeAccount);

        try {
            await this.keplrWallet.connect();
            sessionStorage.setItem(SESSION_STORAGE_WALLET_KEY, SessionStorageWalletOptions.KEPLR);

            this.address = this.keplrWallet.accountAddress;
            this.name = await this.keplrWallet.getName();
            this.loadBalance(); // to not wait for it
        } catch (ex) {
            console.error(ex);
            await this.disconnect();
        }
    }

    @action
    public async connectCosmostation(): Promise < void > {
        // TO DO: Cosmostation
    }

    public async disconnect(): Promise < void > {
        if (this.keplrWallet !== null) {
            try {
                await this.keplrWallet.disconnect();
            } catch (ex) {
                console.error(ex);
            }
            this.keplrWallet = null;
        }

        // TO DO: Cosmostation

        sessionStorage.removeItem(SESSION_STORAGE_WALLET_KEY);
    }

    public async tryConnect(): Promise < void > {
        const sessionStorageWalletOptions = sessionStorage.getItem(SESSION_STORAGE_WALLET_KEY);
        switch (sessionStorageWalletOptions) {
            case SessionStorageWalletOptions.KEPLR:
                await this.connectKeplr();
                break;
            // TO DO: Cosmostation
            default:
                break;
        }
    }

    public isConnected(): boolean {
        if (this.keplrWallet !== null) {
            return this.keplrWallet.isConnected();
        }

        // TO DO: Cosmostation

        return false;
    }

    private async loadBalance(): Promise < void > {
        try {
            if (this.keplrWallet !== null) {
                this.balance = await this.keplrWallet.getBalance();
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
    //     const signer = this.keplrWallet.offlineSigner;
    //     const sender = this.keplrWallet.accountAddress;
    //     const client = await SigningStargateClient.connectWithSigner(Config.CUDOS_NETWORK.RPC, signer);

    //     return { signer, sender, client };
    // }

    getAddress(): string {
        return this.address;
    }

    getBalance(): string {
        return this.balance?.toFixed() ?? '0';
    }

    getName(): string {
        return this.name;
    }
}
