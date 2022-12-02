import S from '../../../core/utilities/Main';

export default class UserEntity {

    userId: string;
    accountId: string;
    cudosWalletAddress: string;
    bitcoinPayoutWalletAddress: string;
    profileImgUrl: string;
    coverImgUrl: string;
    bitcoinWalletAddress: string;

    constructor() {
        this.userId = S.Strings.NOT_EXISTS;
        this.accountId = S.Strings.NOT_EXISTS;
        this.cudosWalletAddress = '';
        this.bitcoinPayoutWalletAddress = '';
        this.profileImgUrl = '/assets/temp/profile-preview.png';
        this.coverImgUrl = '/assets/temp/profile-cover.png';
        this.bitcoinWalletAddress = '';
    }

    isNew(): boolean {
        return this.userId === S.Strings.NOT_EXISTS;
    }

    isBitcointAddressConfirmed(): boolean {
        return this.bitcoinWalletAddress !== '';
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
