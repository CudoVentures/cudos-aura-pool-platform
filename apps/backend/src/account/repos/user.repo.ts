import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table, ForeignKey } from 'sequelize-typescript';
import AccountRepo from './account.repo';

const USER_TABLE_NAME = 'account_users'

export const enum UserRepoColumn {
    USER_ID = 'user_id',
    ACCOUNT_ID = 'account_id',
    CUDOS_WALLET_ADDRESS = 'cudos_wallet_address',
    BITCOIN_PAYOUT_WALLET_ADDRESS = 'bitcoin_payout_wallet_address',
    PROFILE_IMG_URL = 'profile_img_url',
    COVER_IMG_URL = 'cover_img_url',
}

@Table({
    freezeTableName: true,
    tableName: USER_TABLE_NAME,
    underscored: true,
    timestamps: false,
})
export default class UserRepo extends Model {

    @Unique
    @PrimaryKey
    @AutoIncrement
    @Column
        userId: number;

    @Unique
    @ForeignKey(() => AccountRepo)
    @AllowNull(false)
    @Column
        accountId: number;

    @AllowNull(false)
    @Column
        cudosWalletAddress: string;

    @AllowNull(false)
    @Column
        bitcoinPayoutWalletAddress: string;

    @AllowNull(false)
    @Column
        profileImgUrl: string;

    @AllowNull(false)
    @Column
        coverImgUrl: string;

}
