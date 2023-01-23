import BigNumber from 'bignumber.js';
import { action, makeObservable, observable } from 'mobx';
import ModalStore from '../../../core/presentation/stores/ModalStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import SuperAdminEntity from '../../entities/SuperAdminEntity';
import AccountSessionStore from './AccountSessionStore';

export enum MegaWalletTransferType {
    TRANSFER = '1',
    DEPOSIT = '2'
}

export default class MegaWalletTransferModalStore extends ModalStore {
    accountSessionStore: AccountSessionStore;
    walletStore: WalletStore;

    @observable superAdminEntity: SuperAdminEntity;
    @observable destionationAddress: string;
    @observable amount: string;
    @observable balance: BigNumber;
    @observable transferType: MegaWalletTransferType;
    @observable onFinish: () => void

    constructor(accountSessionStore: AccountSessionStore, walletStore: WalletStore) {
        super();

        this.accountSessionStore = accountSessionStore;
        this.walletStore = walletStore;

        this.superAdminEntity = null;
        this.amount = null;
        this.destionationAddress = null;
        this.balance = null;
        this.transferType = null;

        makeObservable(this);
    }

    @action
    showSignal(superAdminEntity: SuperAdminEntity, transferType: MegaWalletTransferType, onFinish: () => void) {
        this.superAdminEntity = superAdminEntity;
        this.transferType = transferType;
        this.amount = '0';
        this.onFinish = onFinish;
        this.fetchBalance();

        if (this.isTransfer() === true) {
            this.destionationAddress = '';
        }

        if (this.isDeposit() === true) {
            this.destionationAddress = superAdminEntity.cudosRoyalteesAddress;
        }

        this.show();
    }

    hide = action(() => {
        this.amount = null;
        this.transferType = null;
        this.destionationAddress = null;
        this.balance = null;
        this.superAdminEntity = null;

        super.hide();
    })

    isTransfer(): boolean {
        return this.transferType === MegaWalletTransferType.TRANSFER;
    }

    isDeposit(): boolean {
        return this.transferType === MegaWalletTransferType.DEPOSIT;
    }

    fetchBalance() {
        this.balance = this.walletStore.getBalanceSafe();
    }

    getBalanceFormatted(): string {
        const fmt = {
            decimalSeparator: '.',
            groupSeparator: ',',
            groupSize: 3,
            secondaryGroupSize: 2,
            suffix: ' CUDOS',
        }

        return this.balance?.toFormat(fmt) ?? '0 CUDOS';
    }

    onClickSetMax = action(() => {
        this.amount = this.balance?.toString(10) ?? '0';
    })

    onAddressChange = action((input) => {
        this.destionationAddress = input;
    })

    onInputChange = action((input) => {
        this.amount = input
    })

    onSubmit = async () => {
        try {
            await this.walletStore.sendCudos(this.destionationAddress, new BigNumber(this.amount));
            this.hide();
        } catch (e) {
            console.log(e);
        }
    }
}
