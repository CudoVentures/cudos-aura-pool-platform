import BigNumber from 'bignumber.js';
import { action, makeObservable, observable } from 'mobx';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import ModalStore from '../../../core/presentation/stores/ModalStore';
import CudosRepo from '../../../cudos-data/presentation/repos/CudosRepo';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import UserEntity from '../../entities/UserEntity';
import AccountRepo from '../repos/AccountRepo';

export default class EditUserBtcModalStore extends ModalStore {

    accountRepo: AccountRepo;
    cudosRepo: CudosRepo;
    alertStore: AlertStore;
    walletStore: WalletStore;

    @observable userEntity: UserEntity;
    bitcoinPayoutWalletAddress: string;
    @observable displayBitcoinPayoutWalletAddress: string;
    @observable onFinish: (btcPayoutAddress: string) => void;

    constructor(accountRepo: AccountRepo, cudosRepo: CudosRepo, alertStore: AlertStore, walletStore: WalletStore) {
        super();

        this.accountRepo = accountRepo;
        this.cudosRepo = cudosRepo;
        this.alertStore = alertStore;
        this.walletStore = walletStore;

        this.userEntity = null;
        this.bitcoinPayoutWalletAddress = '';
        this.displayBitcoinPayoutWalletAddress = '';

        makeObservable(this);
    }

    @action
    async showSignal(userEntity: UserEntity, bitcoinPayoutAddress: string, onFinish: (btcPayoutAddress: string) => void) {
        this.userEntity = userEntity;
        this.bitcoinPayoutWalletAddress = bitcoinPayoutAddress
        this.displayBitcoinPayoutWalletAddress = bitcoinPayoutAddress
        this.onFinish = onFinish;

        this.show();
    }

    @action
    showSignalWithDefaultCallback(userEntity: UserEntity, bitcoinPayoutAddress: string) {
        const clonedUserEntity = userEntity.clone();
        this.showSignal(clonedUserEntity, bitcoinPayoutAddress, action(() => {
            userEntity.copy(clonedUserEntity);
        }));
    }

    onChangeBitcoinPayoutWalletAddress = action((value: string) => {
        this.displayBitcoinPayoutWalletAddress = value;
    })

    isBtcAddressChanged(): boolean {
        return this.bitcoinPayoutWalletAddress !== this.displayBitcoinPayoutWalletAddress;
    }

    hide = action(() => {
        this.userEntity = null;
        this.bitcoinPayoutWalletAddress = '';
        this.displayBitcoinPayoutWalletAddress = '';
        super.hide();
    })

    async creditBitcoinPayoutAddress(): Promise < void > {
        if (this.walletStore.isConnected() === false) {
            this.alertStore.show('Please connect a wallet');
            throw new Error('Please connect a wallet');
        }

        const client = await this.walletStore.getClient();
        const walletAddress = this.walletStore.getAddress();

        const balance = await this.cudosRepo.fetchAcudosBalance(walletAddress);
        if (balance.eq(new BigNumber(0)) === true) {
            this.alertStore.show('Not enough funds');
            throw new Error('Not enough funds');
        }

        try {
            await this.cudosRepo.creditBitcoinPayoutAddress(client, walletAddress, this.displayBitcoinPayoutWalletAddress);
            this.onFinish(this.displayBitcoinPayoutWalletAddress);
        } catch (ex) {
            this.alertStore.show('Unable to update BTC payout address');
            throw Error('Unable to confirm bitcoin address');
        }
    }

}
