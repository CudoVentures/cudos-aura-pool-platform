import { action, makeObservable, observable } from 'mobx';

export default class ModalStore {

    @observable visible = false;

    constructor() {
        makeObservable(this);
        this.hide = this.hide.bind(this);
    }

    show = action(() => {
        this.visible = true;
    })

    @action
    hide() {
        this.visible = false;
    }

}
