import S from '../../../core/utilities/Main';
import { action, makeObservable, observable } from 'mobx';
import ModalStore from '../../../core/presentation/stores/ModalStore';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import ImageEntity, { PictureType } from '../../../upload-file/entities/ImageEntity';
import MiningFarmRepo from '../repos/MiningFarmRepo';

export default class EditMiningFarmModalStore extends ModalStore {
    miningFarmRepo: MiningFarmRepo;

    @observable miningFarmEntity: MiningFarmEntity;
    @observable coverImage: ImageEntity;
    @observable profileImage: ImageEntity;
    @observable onFinish: () => void;

    constructor(miningFarmRepo: MiningFarmRepo) {
        super();

        this.miningFarmRepo = miningFarmRepo;

        this.miningFarmEntity = null;
        this.coverImage = null;
        this.profileImage = null;

        makeObservable(this);
    }

    @action
    showSignal(miningFarmEntity: MiningFarmEntity, onFinish: () => void) {
        this.miningFarmEntity = miningFarmEntity;
        this.coverImage = new ImageEntity();
        this.coverImage.base64 = miningFarmEntity.coverImgUrl;
        this.profileImage = new ImageEntity();
        this.profileImage.base64 = miningFarmEntity.profileImgUrl;
        this.onFinish = onFinish;

        this.show();
    }

    @action
    showSignalWithDefaultCallback(miningFarmEntity: MiningFarmEntity) {
        const clonedMiningFarmEntity = miningFarmEntity.clone();
        this.showSignal(clonedMiningFarmEntity, action(() => {
            miningFarmEntity.copy(clonedMiningFarmEntity);
        }));
    }

    hide = action(() => {
        this.miningFarmEntity = null;
        this.coverImage = null;
        this.profileImage = null;
        super.hide();
    });

    @action
    changeCoverImage(base64File: string) {
        this.coverImage = ImageEntity.new(base64File, PictureType.FARM_COVER);
    }

    @action
    changeProfileImage(base64File: string) {
        this.profileImage = ImageEntity.new(base64File, PictureType.FARM_PROFILE);
    }

    @action
    async executeMiningFarmEditEdit() {
        this.miningFarmEntity.setCoverImgUrlAsBase64(this.coverImage.base64);
        this.miningFarmEntity.setProfileImgUrlAsBase64(this.profileImage.base64);
        await this.miningFarmRepo.creditMiningFarm(this.miningFarmEntity);
    }
}
