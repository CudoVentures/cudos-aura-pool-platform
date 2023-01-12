import { StdSignature } from 'cudosjs';
import { action, observable, makeObservable } from 'mobx';
import ModalStore from '../../../../core/presentation/stores/ModalStore';
import S from '../../../../core/utilities/Main';
import AccountRepo from '../../../accounts/presentation/repos/AccountRepo';
import WalletStore, { SessionStorageWalletOptions } from '../../../ledger/presentation/stores/WalletStore';

enum WalletSelectMode {
    USER = 1,
    ADMIN = 2,
    SUPER_ADMIN = 3,
}

export enum ProgressSteps {
    CONNECT_WALLET = 1,
    SIGN = 2,
    KYC = 3,
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
    @observable identityTx: TransactionStatus;
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
        this.identityTx = TransactionStatus.NOT_INITIALIZED;
        this.signature = null;
        this.sequence = S.NOT_EXISTS;
        this.accountNumber = S.NOT_EXISTS;
        this.onFinish = null;

        makeObservable(this);
    }

    @action
    moveToProgressStepConnectWallet() {
        this.progressStep = ProgressSteps.CONNECT_WALLET;
    }

    @action
    moveToProgressStepSign() {
        this.progressStep = ProgressSteps.SIGN;
    }

    @action
    moveToProgressStepKyc() {
        this.progressStep = ProgressSteps.KYC;
    }

    @action
    markAsWalletConnecting(walletOption: SessionStorageWalletOptions) {
        this.walletOption = walletOption;
        this.walletConnectionStep = WalletConnectionSteps.CONNECTING;
    }

    @action
    markAsWalletConnectedSuccessfully() {
        this.walletConnectionStep = WalletConnectionSteps.CONNECTED_SUCCESSFULLY;
    }

    @action
    markAsWalletError() {
        this.walletConnectionStep = WalletConnectionSteps.ERROR;
    }

    @action
    markIdentityTxWaiting() {
        this.identityTx = TransactionStatus.WAITING;
    }

    @action
    markIdentityTxDoneSuccessfully() {
        this.identityTx = TransactionStatus.DONE_SUCCESSFULLY;
    }

    @action
    markIdentityTxError() {
        this.identityTx = TransactionStatus.ERROR;
    }

    isModeUser(): boolean {
        return this.walletSelectMode === WalletSelectMode.USER;
    }

    isModeAdmin(): boolean {
        return this.walletSelectMode === WalletSelectMode.ADMIN;
    }

    isModeSuperAdmin(): boolean {
        return this.walletSelectMode === WalletSelectMode.SUPER_ADMIN;
    }

    isProgressStepConnectWallet(): boolean {
        return this.progressStep === ProgressSteps.CONNECT_WALLET;
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
            case ProgressSteps.SIGN:
                return true;
            case ProgressSteps.KYC:
                return true;
            default:
                return false;
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
    showSignalAsSuperAdmin() {
        this.showSignal(WalletSelectMode.SUPER_ADMIN, null);
    }

    showSignal(walletSelectMode: WalletSelectMode, onFinish: (signedTx: StdSignature | null, sequence: number, accountNumber: number) => void) {
        this.walletSelectMode = walletSelectMode;
        this.progressStep = ProgressSteps.CONNECT_WALLET;
        this.walletConnectionStep = WalletConnectionSteps.NOT_INITIALIZED;
        this.walletOption = SessionStorageWalletOptions.KEPLR;
        this.identityTx = TransactionStatus.NOT_INITIALIZED;
        this.onFinish = onFinish;

        this.show();
    }

    hide = action(() => {
        this.walletSelectMode = WalletSelectMode.USER;
        this.progressStep = ProgressSteps.CONNECT_WALLET;
        this.walletConnectionStep = WalletConnectionSteps.NOT_INITIALIZED;
        this.walletOption = SessionStorageWalletOptions.KEPLR;
        this.identityTx = TransactionStatus.NOT_INITIALIZED;
        this.signature = null;
        this.sequence = S.NOT_EXISTS;
        this.accountNumber = S.NOT_EXISTS;
        this.onFinish = null;

        super.hide();
    })
}
