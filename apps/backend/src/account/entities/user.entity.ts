import { NOT_EXISTS_INT } from '../../common/utils';
import { UserJsonValidator } from '../account.types';
import UserRepo from '../repos/user.repo';

export default class UserEntity {

    userId: number;
    accountId: number;
    cudosWalletAddress: string;
    profileImgUrl: string;
    coverImgUrl: string;

    constructor() {
        this.userId = NOT_EXISTS_INT;
        this.accountId = NOT_EXISTS_INT;
        this.cudosWalletAddress = '';
        this.profileImgUrl = '/assets/profile/profile.png';
        this.coverImgUrl = '/assets/profile/cover.png';
    }

    isNew(): boolean {
        return this.userId === NOT_EXISTS_INT;
    }

    static toRepo(entity: UserEntity): UserRepo {
        if (entity === null) {
            return null;
        }

        const repoJson = new UserRepo();

        if (entity.isNew() === false) {
            repoJson.userId = entity.userId;
        }
        repoJson.accountId = entity.accountId;
        repoJson.cudosWalletAddress = entity.cudosWalletAddress;
        repoJson.profileImgUrl = entity.profileImgUrl;
        repoJson.coverImgUrl = entity.coverImgUrl;

        return repoJson;
    }

    static fromRepo(repoJson: UserRepo): UserEntity {
        if (repoJson === null) {
            return null;
        }

        const entity = new UserEntity();

        entity.userId = repoJson.userId ?? entity.userId;
        entity.accountId = repoJson.accountId ?? entity.accountId;
        entity.cudosWalletAddress = repoJson.cudosWalletAddress ?? entity.cudosWalletAddress;
        entity.profileImgUrl = repoJson.profileImgUrl ?? entity.profileImgUrl;
        entity.coverImgUrl = repoJson.coverImgUrl ?? entity.coverImgUrl;

        return entity;
    }

    static toJson(entity: UserEntity): UserJsonValidator {
        if (entity === null) {
            return null;
        }

        return {
            'userId': entity.userId.toString(),
            'accountId': entity.accountId.toString(),
            'cudosWalletAddress': entity.cudosWalletAddress,
            'profileImgUrl': entity.profileImgUrl,
            'coverImgUrl': entity.coverImgUrl,
        }
    }

    static fromJson(json: UserJsonValidator): UserEntity {
        if (json === null) {
            return null;
        }

        const entity = new UserEntity();

        entity.userId = parseInt(json.userId ?? entity.userId.toString());
        entity.accountId = parseInt(json.accountId ?? entity.accountId.toString());
        entity.cudosWalletAddress = json.cudosWalletAddress ?? entity.cudosWalletAddress;
        entity.profileImgUrl = json.profileImgUrl ?? entity.profileImgUrl;
        entity.coverImgUrl = json.coverImgUrl ?? entity.coverImgUrl;

        return entity;
    }

}
