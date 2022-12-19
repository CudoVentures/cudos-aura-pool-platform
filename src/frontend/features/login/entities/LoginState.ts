import { makeAutoObservable } from 'mobx';
import LoginStore from '../presentation/stores/LoginStore';

export default class LoginState {

    constructor(a: LoginStore) {
        makeAutoObservable(this);
    }

}
