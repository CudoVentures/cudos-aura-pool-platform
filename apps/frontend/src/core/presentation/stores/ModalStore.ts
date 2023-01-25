import { action, makeObservable, observable, runInAction } from 'mobx';

export default class ModalStore {

    @observable visible = false;

    constructor() {
        makeObservable(this);
        this.hide = this.hide.bind(this);
    }

    show = action(() => {
        this.visible = true;
    })

    hide() {
        runInAction(() => {
            this.visible = false;
        });
    }

}
