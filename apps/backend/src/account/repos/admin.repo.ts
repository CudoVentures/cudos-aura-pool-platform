import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table, ForeignKey } from 'sequelize-typescript';
import AccountRepo from './account.repo';

const ADMIN_TABLE_NAME = 'accounts_admins'

export const enum AdminRepoColumn {
    ADMIN_ID = 'admin_id',
    ACCOUNT_ID = 'account_id',
    CUDOS_WALLET_ADDRESS = 'cudos_wallet_address',
}

@Table({
    freezeTableName: true,
    tableName: ADMIN_TABLE_NAME,
    underscored: true,
    timestamps: false,
})
export default class AdminRepo extends Model {

    @Unique
    @PrimaryKey
    @AutoIncrement
    @Column
        adminId: number;

    @ForeignKey(() => AccountRepo)
    @AllowNull(false)
    @Unique
    @Column
        accountId: number;

    @AllowNull(false)
    @Column
        cudosWalletAddress: string;

}
