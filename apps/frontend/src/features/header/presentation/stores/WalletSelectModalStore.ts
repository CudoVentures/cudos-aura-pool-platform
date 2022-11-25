import { action, observable, makeObservable } from 'mobx';
import ModalStore from '../../../../core/presentation/stores/ModalStore';
import { SessionStorageWalletOptions } from '../../../ledger/presentation/stores/WalletStore';

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

    @observable progressStep: ProgressSteps;
    @observable walletConnectionStep: WalletConnectionSteps;
    @observable walletOption: SessionStorageWalletOptions;
    @observable bitcoinAddress: string;
    @observable bitcoinAddressTx: TransactionStatus;
    @observable identityTx: TransactionStatus;

    constructor() {
        super();

        this.progressStep = ProgressSteps.CONNECT_WALLET;
        this.walletConnectionStep = WalletConnectionSteps.NOT_INITIALIZED;
        this.walletOption = SessionStorageWalletOptions.KEPLR;
        this.bitcoinAddressTx = TransactionStatus.NOT_INITIALIZED;
        this.identityTx = TransactionStatus.NOT_INITIALIZED;

        this.bitcoinAddress = '';

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

    @action
    showSignal() {
        this.progressStep = ProgressSteps.CONNECT_WALLET;
        this.walletConnectionStep = WalletConnectionSteps.NOT_INITIALIZED;
        this.walletOption = SessionStorageWalletOptions.KEPLR;
        this.bitcoinAddressTx = TransactionStatus.NOT_INITIALIZED;
        this.identityTx = TransactionStatus.NOT_INITIALIZED;

        this.bitcoinAddress = '';

        this.show();
    }

    hide = () => {
        super.hide();

        this.progressStep = ProgressSteps.CONNECT_WALLET;
        this.walletConnectionStep = WalletConnectionSteps.NOT_INITIALIZED;
        this.walletOption = SessionStorageWalletOptions.KEPLR;
        this.bitcoinAddressTx = TransactionStatus.NOT_INITIALIZED;
        this.identityTx = TransactionStatus.NOT_INITIALIZED;

        this.bitcoinAddress = '';
    }
}
