import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table, ForeignKey, DataType } from 'sequelize-typescript';
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
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        userId: number;

    @ForeignKey(() => AccountRepo)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        accountId: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        cudosWalletAddress: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING, defaultValue: '' })
        bitcoinPayoutWalletAddress: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        profileImgUrl: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        coverImgUrl: string;

}
