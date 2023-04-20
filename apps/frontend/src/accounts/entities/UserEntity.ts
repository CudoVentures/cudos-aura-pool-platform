import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';

const DEFAULT_PROFILE_IMG_URL = '/assets/profile/profile.png';

export default class UserEntity {

    userId: string;
    accountId: string;
    cudosWalletAddress: string;
    profileImgUrl: string;
    coverImgUrl: string;

    constructor() {
        this.userId = S.Strings.NOT_EXISTS;
        this.accountId = S.Strings.NOT_EXISTS;
        this.cudosWalletAddress = '';
        this.profileImgUrl = DEFAULT_PROFILE_IMG_URL;
        this.coverImgUrl = '/assets/profile/cover.png';

        makeAutoObservable(this);
    }

    hasProfileImg(): boolean {
        return this.profileImgUrl !== DEFAULT_PROFILE_IMG_URL;
    }

    isNew(): boolean {
        return this.userId === S.Strings.NOT_EXISTS;
    }

    clone(): UserEntity {
        return Object.assign(new UserEntity(), this);
    }

    copy(source: UserEntity) {
        Object.assign(this, source)
    }

    static toJson(entity: UserEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'userId': entity.userId,
            'accountId': entity.accountId,
            'cudosWalletAddress': entity.cudosWalletAddress,
            'profileImgUrl': entity.profileImgUrl,
            'coverImgUrl': entity.coverImgUrl,
        }
    }

    static fromJson(json): UserEntity {
        if (json === null) {
            return null;
        }

        const entity = new UserEntity();

        entity.userId = (json.userId ?? entity.userId).toString();
        entity.accountId = (json.accountId ?? entity.accountId).toString();
        entity.cudosWalletAddress = json.cudosWalletAddress ?? entity.cudosWalletAddress;
        entity.profileImgUrl = json.profileImgUrl ?? entity.profileImgUrl;
        entity.coverImgUrl = json.coverImgUrl ?? entity.coverImgUrl;

        return entity;
    }

}
