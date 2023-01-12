import { action, makeObservable } from 'mobx';
import ModalStore from '../../../core/presentation/stores/ModalStore';

export default class CreditCollectionSuccessModalStore extends ModalStore {

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
