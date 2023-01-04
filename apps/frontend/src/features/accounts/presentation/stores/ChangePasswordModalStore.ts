import { action, makeObservable, observable } from 'mobx';

import ModalStore from '../../../../core/presentation/stores/ModalStore';
import S from '../../../../core/utilities/Main';
import AccountRepo from '../repos/AccountRepo';

export default class ChangePasswordModalStore extends ModalStore {
    accountRepo: AccountRepo;

    @observable changeInitialPass: boolean;
    @observable oldPassword: string;
    @observable newPassword: string;
    @observable repeatNewPassword: string;

    constructor(accountRepo: AccountRepo) {
        super();

        this.changeInitialPass = false;
        this.oldPassword = S.Strings.EMPTY;
        this.newPassword = S.Strings.EMPTY;
        this.repeatNewPassword = S.Strings.EMPTY;

        this.accountRepo = accountRepo;

        makeObservable(this);
    }

    shouldDisplayChangeInitialPasswordInfo(): boolean {
        return this.changeInitialPass;
    }

    async changePassword(): Promise <void> {
        await this.accountRepo.editSessionAccountPass(this.oldPassword, this.newPassword, '');
        this.hide();
    }

    setOldPassword = action((value) => {
        this.oldPassword = value;
    })

    setNewPassword = action((value) => {
        this.newPassword = value;
    })

    setRepeatNewPassword = action((value) => {
        this.repeatNewPassword = value;
    })

    @action
    async showSignal(changeInitialPass: boolean) {
        this.changeInitialPass = changeInitialPass;
        this.show();
    }

    hide = action(() => {
        this.changeInitialPass = false;
        this.oldPassword = S.Strings.EMPTY;
        this.newPassword = S.Strings.EMPTY;
        this.repeatNewPassword = S.Strings.EMPTY;
        super.hide();
    })

}
