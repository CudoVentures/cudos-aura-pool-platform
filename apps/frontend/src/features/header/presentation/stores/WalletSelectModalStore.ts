import { StdSignature } from 'cudosjs';
import { action, observable, makeObservable } from 'mobx';
import ModalStore from '../../../../core/presentation/stores/ModalStore';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';
import S from '../../../../core/utilities/Main';
import AccountRepo from '../../../accounts/presentation/repos/AccountRepo';
import WalletStore, { SessionStorageWalletOptions } from '../../../ledger/presentation/stores/WalletStore';

enum WalletSelectMode {
    USER = 1,
    ADMIN = 2,
}

export enum ProgressSteps {
    CONNECT_WALLET = 1,
    BTC = 2,
    SIGN = 3,
    KYC = 4,
}

enum WalletConnectionSteps {
    NOT_INITIALIZED = 1,
    CONNECTING = 2,
    CONNECTED_SUCCESSFULLY = 3,
    ERROR = 4,
}

enum TransactionStatus {
    NOT_INITIALIZED = 1,
    WAITING = 2,
    DONE_SUCCESSFULLY = 3,
    ERROR = 4,
}

export default class WalletSelectModal extends ModalStore {

    @observable walletSelectMode: WalletSelectMode;
    @observable progressStep: ProgressSteps;
    @observable walletConnectionStep: WalletConnectionSteps;
    @observable walletOption: SessionStorageWalletOptions;
    @observable bitcoinAddressTx: TransactionStatus;
    @observable identityTx: TransactionStatus;
    @observable bitcoinAddress: string;
    @observable signature: StdSignature;
    @observable sequence: number;
    @observable accountNumber: number;
    @observable onFinish: (signedTx: StdSignature | null, sequence: number, accountNumber: number) => void;

    accountRepo: AccountRepo;
    walletStore: WalletStore;

    constructor(walletStore: WalletStore, accountRepo: AccountRepo) {
        super();

        this.walletStore = walletStore;
        this.accountRepo = accountRepo;

        this.walletSelectMode = WalletSelectMode.USER;
        this.progressStep = ProgressSteps.CONNECT_WALLET;
        this.walletConnectionStep = WalletConnectionSteps.NOT_INITIALIZED;
        this.walletOption = SessionStorageWalletOptions.KEPLR;
        this.bitcoinAddressTx = TransactionStatus.NOT_INITIALIZED;
        this.identityTx = TransactionStatus.NOT_INITIALIZED;
        this.bitcoinAddress = '';
        this.signature = null;
        this.sequence = S.NOT_EXISTS;
        this.accountNumber = S.NOT_EXISTS;
        this.onFinish = null;

        makeObservable(this);
    }

    moveToProgressStepConnectWallet() {
        this.progressStep = ProgressSteps.CONNECT_WALLET;
    }

    moveToProgressStepBtc() {
        this.progressStep = ProgressSteps.BTC;
    }

    moveToProgressStepSign() {
        this.progressStep = ProgressSteps.SIGN;
    }

    moveToProgressStepKyc() {
        this.progressStep = ProgressSteps.KYC;
    }

    markAsWalletConnecting(walletOption: SessionStorageWalletOptions) {
        this.walletOption = walletOption;
        this.walletConnectionStep = WalletConnectionSteps.CONNECTING;
    }

    markAsWalletConnectedSuccessfully() {
        this.walletConnectionStep = WalletConnectionSteps.CONNECTED_SUCCESSFULLY;
    }

    markAsWalletError() {
        this.walletConnectionStep = WalletConnectionSteps.ERROR;
    }

    markBitcoinAddressTxWaiting() {
        this.bitcoinAddressTx = TransactionStatus.WAITING;
    }

    markBitcoinAddressTxDoneSuccessfully() {
        this.bitcoinAddressTx = TransactionStatus.DONE_SUCCESSFULLY;
    }

    markBitcoinAddressTxError() {
        this.bitcoinAddressTx = TransactionStatus.ERROR;
    }

    markIdentityTxWaiting() {
        this.identityTx = TransactionStatus.WAITING;
    }

    markIdentityTxDoneSuccessfully() {
        this.identityTx = TransactionStatus.DONE_SUCCESSFULLY;
    }

    markIdentityTxError() {
        this.identityTx = TransactionStatus.ERROR;
    }

    isModeUser(): boolean {
        return this.walletSelectMode === WalletSelectMode.USER;
    }

    isModeAdmin(): boolean {
        return this.walletSelectMode === WalletSelectMode.ADMIN;
    }

    isProgressStepConnectWallet(): boolean {
        return this.progressStep === ProgressSteps.CONNECT_WALLET;
    }

    isProgressStepBtc(): boolean {
        return this.progressStep === ProgressSteps.BTC;
    }

    isProgressStepSign(): boolean {
        return this.progressStep === ProgressSteps.SIGN;
    }

    isProgressStepKyc(): boolean {
        return this.progressStep === ProgressSteps.KYC;
    }

    isWalletConnecting(): boolean {
        return this.walletConnectionStep === WalletConnectionSteps.CONNECTING;
    }

    isWalletConnectedSuccessfully(): boolean {
        return this.walletConnectionStep === WalletConnectionSteps.CONNECTED_SUCCESSFULLY;
    }

    isWalletError(): boolean {
        return this.walletConnectionStep === WalletConnectionSteps.ERROR;
    }

    isKeplr(): boolean {
        return this.walletOption === SessionStorageWalletOptions.KEPLR;
    }

    isCosmostation(): boolean {
        return this.walletOption === SessionStorageWalletOptions.COSMOSTATION;
    }

    isKeplrConnectedSuccessfully(): boolean {
        return this.isKeplr() === true && this.isWalletConnectedSuccessfully() === true;
    }

    isKeplrError(): boolean {
        return this.isKeplr() === true && this.isWalletError() === true;
    }

    isCosmostationConnectedSuccessfully(): boolean {
        return this.isCosmostation() === true && this.isWalletConnectedSuccessfully() === true;
    }

    isCosmostationError(): boolean {
        return this.isCosmostation() === true && this.isWalletError() === true;
    }

    isBitcoinAddressTxWaiting(): boolean {
        return this.bitcoinAddressTx === TransactionStatus.WAITING;
    }

    isBitcoinAddressTxDoneSuccessfully(): boolean {
        return this.bitcoinAddressTx === TransactionStatus.DONE_SUCCESSFULLY;
    }

    isBitcoinAddressTxError(): boolean {
        return this.bitcoinAddressTx === TransactionStatus.ERROR;
    }

    isIdentityTxWaiting(): boolean {
        return this.identityTx === TransactionStatus.WAITING;
    }

    isIdentityTxDoneSuccessfully(): boolean {
        return this.identityTx === TransactionStatus.DONE_SUCCESSFULLY;
    }

    isIdentityTxError(): boolean {
        return this.identityTx === TransactionStatus.ERROR;
    }

    async isBitcoinAddressSet(): boolean {
        const address = await this.accountRepo.fetchBitcoinAddress(this.walletStore.address);

        return address !== S.Strings.EMPTY
    }

    hasNextStep(): boolean {
        switch (this.progressStep) {
            case ProgressSteps.CONNECT_WALLET:
                return this.isWalletConnectedSuccessfully();
            case ProgressSteps.BTC:
                return this.bitcoinAddress !== '' && this.isBitcoinAddressTxError() === false;
            case ProgressSteps.SIGN:
                return true;
            case ProgressSteps.KYC:
                return true;
            default:
                return false;
        }
    }

    async confirmBitcoinAddress(): Promise < void > {
        const client = await this.walletStore.getClient();
        const walletAddress = this.walletStore.getAddress();

        const balance = await await this.accountRepo.fetchAddressCudosBalance(walletAddress);
        if (balance === '0') {
            throw Error('This address does not have any CUDOS on chain.');
        }

        const result = await this.accountRepo.confirmBitcoinAddress(client, walletAddress, this.bitcoinAddress);
        if (result === false) {
            throw Error('Unable to confirm bitcoin address');
        }
    }

    @action
    showSignalAsUser() {
        this.showSignal(WalletSelectMode.USER, null);
    }

    @action
    showSignalAsAdmin(onFinish: (signedTx: StdSignature | null, sequence: number, accountNumber: number) => void) {
        this.showSignal(WalletSelectMode.ADMIN, onFinish);
    }

    @action
    showSignal(walletSelectMode: WalletSelectMode, onFinish: (signedTx: StdSignature | null, sequence: number, accountNumber: number) => void) {
        this.walletSelectMode = walletSelectMode;
        this.progressStep = ProgressSteps.CONNECT_WALLET;
        this.walletConnectionStep = WalletConnectionSteps.NOT_INITIALIZED;
        this.walletOption = SessionStorageWalletOptions.KEPLR;
        this.bitcoinAddressTx = TransactionStatus.NOT_INITIALIZED;
        this.identityTx = TransactionStatus.NOT_INITIALIZED;
        this.bitcoinAddress = '';
        this.onFinish = onFinish;

        this.show();
    }

    hide = () => {
        super.hide();

        this.walletSelectMode = WalletSelectMode.USER;
        this.progressStep = ProgressSteps.CONNECT_WALLET;
        this.walletConnectionStep = WalletConnectionSteps.NOT_INITIALIZED;
        this.walletOption = SessionStorageWalletOptions.KEPLR;
        this.bitcoinAddressTx = TransactionStatus.NOT_INITIALIZED;
        this.identityTx = TransactionStatus.NOT_INITIALIZED;
        this.bitcoinAddress = '';
        this.signature = null;
        this.sequence = S.NOT_EXISTS;
        this.accountNumber = S.NOT_EXISTS;
        this.onFinish = null;

        this.bitcoinAddress = '';
    }
}
