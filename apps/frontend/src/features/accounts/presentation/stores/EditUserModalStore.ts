import { action, makeObservable, observable, runInAction } from 'mobx';
import ModalStore from '../../../../core/presentation/stores/ModalStore';
import ImageEntity, { PictureType } from '../../../upload-file/entities/ImageEntity';
import AccountRepo from '../repos/AccountRepo';
import UserEntity from '../../entities/UserEntity';

export default class EditUserModalStore extends ModalStore {

    accountRepo: AccountRepo;

    @observable userEntity: UserEntity;
    @observable coverImage: ImageEntity;
    @observable profileImage: ImageEntity;
    @observable onFinish: () => void;

    constructor(accountRepo: AccountRepo) {
        super();

        this.accountRepo = accountRepo;

        this.userEntity = null;
        this.coverImage = null;
        this.profileImage = null;

        makeObservable(this);
    }

    @action
    showSignal(userEntity: UserEntity, onFinish: () => void) {
        this.userEntity = userEntity;
        this.coverImage = new ImageEntity();
        this.coverImage.base64 = userEntity.coverImgUrl;
        this.profileImage = new ImageEntity();
        this.profileImage.base64 = userEntity.profileImgUrl;
        this.onFinish = onFinish;

        this.show();
    }

    @action
    showSignalWithDefaultCallback(userEntity: UserEntity) {
        const clonedUserEntity = userEntity.clone();
        this.showSignal(clonedUserEntity, () => {
            runInAction(() => {
                userEntity.copy(clonedUserEntity);
            });
        });
    }

    hide = () => {
        runInAction(() => {
            this.userEntity = null;
            this.coverImage = null;
            this.profileImage = null;
            super.hide();
        });
    }

    @action
    changeCoverImage(base64File: string) {
        this.coverImage = ImageEntity.new(base64File, PictureType.USER_COVER);
    }

    @action
    changeProfileImage(base64File: string) {
        this.profileImage = ImageEntity.new(base64File, PictureType.USER_PROFILE);
    }

    async editSessionUser() {
        this.userEntity.coverImgUrl = this.coverImage.base64;
        this.userEntity.profileImgUrl = this.profileImage.base64;
        await this.accountRepo.editSessionUser(this.userEntity);
    }
}
