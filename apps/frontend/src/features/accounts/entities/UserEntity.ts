import BigNumber from 'bignumber.js';

import S from '../../../core/utilities/Main';

export default class UserEntity {

    userId: string;
    accountId: string;
    cudosWalletAddress: string;
    totalBtcEarned: BigNumber;
    totalHashPower: number;
    profileImgUrl: string;
    coverImgUrl: string;
    bitcoinWalletAddress: string;

    constructor() {
        this.userId = S.Strings.NOT_EXISTS;
        this.accountId = S.Strings.NOT_EXISTS;
        this.cudosWalletAddress = '';
        this.totalBtcEarned = new BigNumber(S.NOT_EXISTS);
        this.totalHashPower = S.NOT_EXISTS;
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
            'id': parseInt(entity.userId),
            'account_id': parseInt(entity.accountId),
            'cudos_address': entity.cudosWalletAddress,
            'total_btc_earned': entity.totalBtcEarned.toString(),
            'total_hashpower': entity.totalHashPower,
            'profile_img': entity.profileImgUrl,
            'cover_img': entity.coverImgUrl,
            'payout_address': entity.bitcoinWalletAddress,
        }
    }

    static fromJson(json): UserEntity {
        if (json === null) {
            return null;
        }

        const entity = new UserEntity();

        entity.userId = (json.id ?? entity.userId).toString();
        entity.accountId = (json.account_id ?? entity.accountId).toString();
        entity.cudosWalletAddress = json.cudos_address ?? entity.cudosWalletAddress;
        entity.totalBtcEarned = new BigNumber(json.total_btc_earned ?? entity.totalBtcEarned);
        entity.totalHashPower = Number(json.total_hashpower ?? entity.totalHashPower);
        entity.profileImgUrl = json.profile_img ?? entity.profileImgUrl;
        entity.coverImgUrl = json.cover_img ?? entity.coverImgUrl;
        entity.bitcoinWalletAddress = (json.payout_address ?? entity.bitcoinWalletAddress).toString();

        return entity;
    }

}
