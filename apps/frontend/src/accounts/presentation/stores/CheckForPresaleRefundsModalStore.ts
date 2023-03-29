import { action, makeObservable, observable, runInAction } from 'mobx';
import ModalStore from '../../../core/presentation/stores/ModalStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import BigNumber from 'bignumber.js';
import { ETH_CONSTS, getEthChainEtherscanLink } from '../../../core/utilities/Constants';
import { Contract } from 'web3-eth-contract';
import contractABI from '../../../ethereum/contracts/CudosAuraPool.sol/CudosAuraPool.json';
import { runInActionAsync } from '../../../core/utilities/ProjectUtils';
import AppStore from '../../../core/presentation/stores/AppStore';
import { CURRENCY_DECIMALS } from 'cudosjs';

export enum RefundModalStage {
    INITIAL,
    PROCESSING,
    SUCCESS,
    FAIL
}

enum PaymentStatus {
    LOCKED = '0',
    WITHDRAWABLE = '1',
    RETURNED = '2'
}

export default class CheckForPresaleRefundsModalStore extends ModalStore {

    appStore: AppStore;
    walletStore: WalletStore;

    @observable availableRefundAmount: BigNumber;
    @observable stage: RefundModalStage;
    contract: Contract;
    txHash: string;
    ethAddress: string;

    constructor(appStore: AppStore, walletStore: WalletStore) {
        super();

        this.appStore = appStore;
        this.walletStore = walletStore;

        this.availableRefundAmount = null;
        this.stage = null;
        this.txHash = null;
        this.contract = null;

        makeObservable(this);
    }

    @action
    async showSignal() {
        this.stage = RefundModalStage.INITIAL;

        const provider = await this.walletStore.getEthProvider();

        const addresses = await provider.eth.getAccounts();
        this.ethAddress = addresses[0];

        this.contract = new provider.eth.Contract(contractABI.abi, ETH_CONSTS.AURA_POOL_CONTRACT_ADDRESS, {
            from: addresses[0],
        });
        const payments = await this.contract.methods.getPayments().call();
        this.availableRefundAmount = payments.filter((payment) => payment.status === PaymentStatus.WITHDRAWABLE)
            .reduce((total, payment) => total.plus(new BigNumber(payment.amount)), new BigNumber(0));

        this.show();
    }

    hide = action(() => {
        this.availableRefundAmount = null;
        this.txHash = null;
        this.contract = null;

        super.hide();
    })

    onClickRefund = async () => {
        try {
            this.appStore.disableActions();

            await runInActionAsync(() => {
                this.stage = RefundModalStage.PROCESSING;
            });

            const tx = await this.contract.methods.withdrawPayments().send();
            if (!tx.transactionHash) {
                throw Error('Transaction do not have hash');
            }

            await runInActionAsync(() => {
                this.txHash = tx.transactionHash;
                this.stage = RefundModalStage.SUCCESS
            });
        } catch (ex) {
            await runInAction(() => {
                this.stage = RefundModalStage.FAIL;
            });
        } finally {
            this.appStore.enableActions();
        }
    }

    getAvailableRefundFormatted() {
        const amountString = this.availableRefundAmount?.shiftedBy(-CURRENCY_DECIMALS).toFixed(4) || 0;

        return `${amountString} ETH`;
    }

    getTxLink() {
        return `https://${getEthChainEtherscanLink()}tx/${this.txHash}`;
    }
}
