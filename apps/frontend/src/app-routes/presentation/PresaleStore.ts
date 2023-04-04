import { makeAutoObservable } from 'mobx';
import { PRESALE_CONSTS } from '../../core/utilities/Constants';

export default class PresaleStore {
    timeLeftToPresale: number;

    constructor() {
        this.timeLeftToPresale = 0;
        this.update();

        makeAutoObservable(this);
    }

    update() {
        const timeLeftToPresale = PRESALE_CONSTS.PRESALE_ENDTIME - Date.now();
        this.timeLeftToPresale = timeLeftToPresale < 0 ? 0 : timeLeftToPresale
    }

    isInPresale(): boolean {
        return this.timeLeftToPresale > 0;
    }

}
