import { makeAutoObservable } from 'mobx';
import React from 'react';

export const enum SnackType {
    SUCCESS = '2',
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

    show(msg: string | React.ReactNode, type: SnackType) {
        this.msg = msg;
        this.type = type;
        this.visible = true;
    }

    hide = () => {
        this.visible = false;
    }

}
