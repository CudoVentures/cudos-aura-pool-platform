import { action, makeObservable } from 'mobx';
import ModalStore from '../../../../core/presentation/stores/ModalStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';

export default class WalletSelectModal extends ModalStore {
    walletStore: WalletStore;

    constructor() {
        super();

        makeObservable(this);
    }

    @action
    showSignal() {
        this.show();
    }

    hide = () => {
        super.hide();
    }
}
