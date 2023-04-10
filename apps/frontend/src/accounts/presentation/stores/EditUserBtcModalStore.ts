import BigNumber from 'bignumber.js';
import { action, makeObservable, observable, runInAction } from 'mobx';
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
    @observable bitcoinPayoutWalletAddress: string;
    @observable onFinish: () => void;

    constructor(accountRepo: AccountRepo, cudosRepo: CudosRepo, alertStore: AlertStore, walletStore: WalletStore) {
        super();

        this.accountRepo = accountRepo;
        this.cudosRepo = cudosRepo;
        this.alertStore = alertStore;
        this.walletStore = walletStore;

        this.userEntity = null;
        this.bitcoinPayoutWalletAddress = '';

        makeObservable(this);
    }

    @action
    async showSignal(userEntity: UserEntity, onFinish: () => void) {
        this.userEntity = userEntity;
        this.bitcoinPayoutWalletAddress = userEntity.bitcoinPayoutWalletAddress;
        this.onFinish = onFinish;

        this.show();
    }

    @action
    showSignalWithDefaultCallback(userEntity: UserEntity) {
        const clonedUserEntity = userEntity.clone();
        this.showSignal(clonedUserEntity, action(() => {
            userEntity.copy(clonedUserEntity);
        }));
    }

    onChangeBitcoinPayoutWalletAddress = action((value: string) => {
        this.bitcoinPayoutWalletAddress = value;
    })

    isBtcAddressChanged(): boolean {
        return this.bitcoinPayoutWalletAddress !== this.userEntity.bitcoinPayoutWalletAddress;
    }

    hide = action(() => {
        this.userEntity = null;
        this.bitcoinPayoutWalletAddress = '';
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
            await this.cudosRepo.creditBitcoinPayoutAddress(client, walletAddress, this.bitcoinPayoutWalletAddress);
            this.userEntity.bitcoinPayoutWalletAddress = this.bitcoinPayoutWalletAddress;
        } catch (ex) {
            this.alertStore.show('Unable to update BTC payout address');
            throw Error('Unable to confirm bitcoin address');
        }
    }

}
