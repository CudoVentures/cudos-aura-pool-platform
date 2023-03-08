import { makeAutoObservable } from 'mobx';
import S from '../../core/utilities/Main';

export default class UserEntity {

    userId: string;
    accountId: string;
    cudosWalletAddress: string;
    bitcoinPayoutWalletAddress: string;
    profileImgUrl: string;
    coverImgUrl: string;

    constructor() {
        this.userId = S.Strings.NOT_EXISTS;
        this.accountId = S.Strings.NOT_EXISTS;
        this.cudosWalletAddress = '';
        this.bitcoinPayoutWalletAddress = '';
        this.profileImgUrl = '/assets/profile/profile.png';
        this.coverImgUrl = '/assets/profile/cover.png';

        makeAutoObservable(this);
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

    hasBitcoinPayoutWalletAddress(): boolean {
        return this.bitcoinPayoutWalletAddress !== '';
    }

    static toJson(entity: UserEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'userId': entity.userId,
            'accountId': entity.accountId,
            'cudosWalletAddress': entity.cudosWalletAddress,
            'bitcoinPayoutWalletAddress': entity.bitcoinPayoutWalletAddress,
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
        entity.bitcoinPayoutWalletAddress = json.bitcoinPayoutWalletAddress ?? entity.bitcoinPayoutWalletAddress;
        entity.profileImgUrl = json.profileImgUrl ?? entity.profileImgUrl;
        entity.coverImgUrl = json.coverImgUrl ?? entity.coverImgUrl;

        return entity;
    }

}
