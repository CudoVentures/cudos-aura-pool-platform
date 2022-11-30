import { action, makeObservable, observable, runInAction } from 'mobx';

import ModalStore from '../../../../core/presentation/stores/ModalStore';
import S from '../../../../core/utilities/Main';
import AccountRepo from '../repos/AccountRepo';

export default class ChangePasswordModalStore extends ModalStore {
    accountRepo: AccountRepo;

    @observable oldPassword: string;
    @observable newPassword: string;
    @observable repeatNewPassword: string;

    constructor(accountRepo: AccountRepo) {
        super();

        this.oldPassword = S.Strings.EMPTY;
        this.newPassword = S.Strings.EMPTY;
        this.repeatNewPassword = S.Strings.EMPTY;

        this.accountRepo = accountRepo;

        makeObservable(this);
    }

    async changePassword(): Promise <void> {
        await this.accountRepo.editSessionAccountPass(this.oldPassword, this.newPassword, '');
        this.hide();
    }

    setOldPassword = (value) => {
        this.oldPassword = value;
    }

    setNewPassword = (value) => {
        this.newPassword = value;
    }

    setRepeatNewPassword = (value) => {
        this.repeatNewPassword = value;
    }

    @action
    async showSignal() {

        runInAction(() => {

            this.show();
        });
    }

    hide = () => {
        this.oldPassword = S.Strings.EMPTY;
        this.newPassword = S.Strings.EMPTY;
        this.repeatNewPassword = S.Strings.EMPTY;

        super.hide();
    }

}
