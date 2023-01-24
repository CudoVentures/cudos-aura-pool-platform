import { makeObservable } from 'mobx';
import ModalStore from '../../../core/presentation/stores/ModalStore';

export default class CreditCollectionSuccessModalStore extends ModalStore {

    constructor() {
        super();
        makeObservable(this);
    }

    showSignal() {
        this.show();
    }

    hide = () => {
        super.hide();
    }
}
