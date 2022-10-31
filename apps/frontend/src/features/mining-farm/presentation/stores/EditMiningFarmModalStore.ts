import S from '../../../../core/utilities/Main';
import { action, makeObservable, observable } from 'mobx';
import ModalStore from '../../../../core/presentation/stores/ModalStore';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import ImageEntity, { PictureType } from '../../../upload-file/entities/ImageEntity';
import MiningFarmRepo from '../repos/MiningFarmRepo';

export default class EditMiningFarmModalStore extends ModalStore {
    miningFarmRepo: MiningFarmRepo;

    @observable miningFarmEntity: MiningFarmEntity;
    @observable coverImage: ImageEntity;
    @observable profileImage: ImageEntity;

    constructor(miningFarmRepo: MiningFarmRepo) {
        super();

        this.miningFarmRepo = miningFarmRepo;

        this.miningFarmEntity = null;
        this.coverImage = null;
        this.profileImage = null;

        makeObservable(this);
    }

    nullateValues() {
        this.miningFarmEntity = null;
    }

    @action
    showSignal(miningFarmEntity: MiningFarmEntity) {
        this.miningFarmEntity = miningFarmEntity;
        this.coverImage = new ImageEntity();
        this.coverImage.base64 = miningFarmEntity.coverImgUrl;
        this.profileImage = new ImageEntity();
        this.profileImage.base64 = miningFarmEntity.profileImgUrl;

        this.show();
    }

    hide = () => {
        this.nullateValues();

        super.hide();
    }

    changeCoverImage(base64File: string) {
        this.coverImage = ImageEntity.new(base64File, PictureType.FARM_COVER);
    }

    changeProfileImage(base64File: string) {
        this.profileImage = ImageEntity.new(base64File, PictureType.FARM_PROFILE);
    }

    executeMiningFarmEditEdit() {
        // save images if new ones are selected
        if (this.profileImage.base64 !== this.miningFarmEntity.profileImgUrl) {
            // TODO: save iamge
        }

        if (this.coverImage.base64 !== this.miningFarmEntity.coverImgUrl && this.coverImage.base64 !== S.Strings.EMPTY) {
            // TODO: save iamge
        }

        // TODO: change image ids if decided so
        this.miningFarmEntity.coverImgUrl = this.coverImage.base64;
        this.miningFarmEntity.profileImgUrl = this.profileImage.base64;

        this.miningFarmRepo.creditMiningFarm(this.miningFarmEntity);
    }
}
