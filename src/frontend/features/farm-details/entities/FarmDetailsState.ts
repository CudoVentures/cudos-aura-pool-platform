import { makeAutoObservable } from 'mobx';
import FarmDetailsStore from '../presentation/stores/FarmDetailsStore';

export default class FarmDetailsState {

    constructor(a: FarmDetailsStore) {
        makeAutoObservable(this);
    }

}
