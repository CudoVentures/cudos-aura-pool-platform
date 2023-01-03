import { action, makeAutoObservable } from 'mobx';
import React from 'react';

export const enum SnackType {
    SUCCESS = 1,
    ERROR = 2,
}

export default class SnackStore {

    visible = false;
    msg: string | React.ReactNode | null = null;
    type: SnackType = SnackType.SUCCESS;

    constructor() {
        makeAutoObservable(this);
    }

    showSuccess(msg: string | React.ReactNode) {
        this.show(msg, SnackType.SUCCESS);
    }

    showError(msg: string | React.ReactNode) {
        this.show(msg, SnackType.ERROR);
    }

    @action
    show(msg: string | React.ReactNode, type: SnackType) {
        this.msg = msg;
        this.type = type;
        this.visible = true;
    }

    hide = action(() => {
        this.visible = false;
    })

}
