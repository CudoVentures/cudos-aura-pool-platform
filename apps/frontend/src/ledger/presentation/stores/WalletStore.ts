import { action, makeAutoObservable, makeObservable, observable } from 'mobx';
import { KeplrWallet, Ledger, CosmostationWallet, StdSignature, CURRENCY_DECIMALS } from 'cudosjs';
import S from '../../../core/utilities/Main';
import { CHAIN_DETAILS, ETH_CONSTS, SIGN_NONCE } from '../../../core/utilities/Constants';
import BigNumber from 'bignumber.js';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import { CudosSigningStargateClient } from 'cudosjs/build/stargate/cudos-signingstargateclient';
import WalletRepo from '../repos/WalletRepo';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import Web3 from 'web3';
import NftRepo from '../../../nft/presentation/repos/NftRepo';
import { formatCudos } from '../../../core/utilities/NumberFormatter';

const SESSION_STORAGE_WALLET_KEY = 'auraPoolConnectedWallet';

export enum SessionStorageWalletOptions {
    KEPLR = 'keplr',
    COSMOSTATION = 'cosmostation',
}

export default class WalletStore {
    alertStore: AlertStore;
    walletRepo: WalletRepo;
    nftRepo: NftRepo;

    web3: Web3;

    ledger: Ledger;
    balance: BigNumber;
    address: string;
    name: string;

    constructor(alertStore: AlertStore, walletRepo: WalletRepo, nftRepo: NftRepo) {
        this.alertStore = alertStore;
        this.walletRepo = walletRepo;
        this.nftRepo = nftRepo;

        this.ledger = null;
        this.balance = null;
        this.address = S.Strings.EMPTY;
        this.name = S.Strings.EMPTY;

        makeAutoObservable(this);
    }

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

    public async connectCosmostation(): Promise < void > {
        this.ledger = new CosmostationWallet({
            CHAIN_ID: CHAIN_DETAILS.CHAIN_ID,
            CHAIN_NAME: CHAIN_DETAILS.CHAIN_NAME,
            RPC: CHAIN_DETAILS.RPC_ADDRESS,
            API: CHAIN_DETAILS.API_ADDRESS,
            STAKING: CHAIN_DETAILS.STAKING_URL,
            GAS_PRICE: CHAIN_DETAILS.GAS_PRICE.toString(10),
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

            await runInActionAsync(() => {
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

            this.nftRepo.clearPurchaseTransactionsSessionStorage();

            await runInActionAsync(() => {
                this.ledger = null;
                this.balance = null;
                this.address = S.Strings.EMPTY;
                this.name = S.Strings.EMPTY;
            });
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

        // const magic = new Magic('pk_live_4C87C970F1258D0B', {
        //     extensions: {
        //         cosmos: new CosmosExtension({
        //             rpcUrl: CHAIN_DETAILS.RPC_ADDRESS,
        //         }),
        //     },
        // });
        // await magic.auth.loginWithMagicLink({ email: 'stavykov@gmail.com' });
        // await magic.cosmos.changeAddress('cudos')
        // const metadata = await magic.user.getMetadata();
        // console.log(metadata);
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

            await runInActionAsync(() => {
                this.balance = balance;
            })
        } catch (ex) {
            await runInActionAsync(() => {
                this.balance = new BigNumber(0);
            });
        }
    }

    async getClient(): Promise < CudosSigningStargateClient > {
        return CudosSigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS, this.ledger.offlineSigner);
    }

    async getSigningClient(): Promise < CudosSigningStargateClient > {
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

    getBalanceSafeInAcudos(): BigNumber {
        return this.getBalanceSafe().shiftedBy(CURRENCY_DECIMALS);
    }

    getAddress(): string {
        return this.address;
    }

    formatBalance(): string {
        return formatCudos(this.balance ?? new BigNumber(0), true);
    }

    getName(): string {
        return this.name;
    }

    formatBalanceInCudosInt(): string {
        return formatCudos(this.balance?.integerValue(BigNumber.ROUND_FLOOR) ?? new BigNumber(0), false, 0)
    }

    formatBalanceInCudosFraction(): string {
        return this.balance?.minus(this.balance.integerValue(BigNumber.ROUND_FLOOR)).shiftedBy(4).toFixed(0) ?? '0';
    }

    sendCudos(destiantionAddress: string, amount: BigNumber): Promise<string> {
        return this.walletRepo.sendCudos(destiantionAddress, amount, this.ledger);
    }

    async getEthProvider() {
        // This function detects most providers injected at window.ethereum
        const web3 = new Web3(window.ethereum);
        if (!web3) {
            throw Error('Metamask not installed.');
        }

        const chainId = await web3.eth.getChainId();
        if (chainId !== ETH_CONSTS.ETH_CHAIN_ID) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: web3.utils.toHex(Number(ETH_CONSTS.ETH_CHAIN_ID)) }],
                });
            } catch (err) {
                console.log(err);
            }
        }

        this.web3 = web3;

        await window.ethereum.enable();

        return this.web3;
    }

    async getEthBalance(): Promise< BigNumber > {
        await this.getEthProvider();
        const accounts = await this.web3.eth.getAccounts();
        const balanceWei = await this.web3.eth.getBalance(accounts[0])
        const balanceEth = this.web3.utils.fromWei(balanceWei);

        return new BigNumber(balanceEth);
    }
}
