import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table, ForeignKey } from 'sequelize-typescript';
import AccountRepo from './account.repo';

const SUPER_ADMIN_TABLE_NAME = 'accounts_super_admins'

export const enum SuperAdminRepoColumn {
    SUPER_ADMIN_ID = 'super_admin_id',
    ACCOUNT_ID = 'account_id',
    CUDOS_ROYALTEES_ADDRESS = 'cudos_royaltees_address',
    FIRST_SALE_CUDOS_ROYALTIES_PERCENT = 'first_sale_cudos_royalties_percent',
    RESALE_CUDOS_ROYALTIES_PERCENT = 'resale_cudos_royalties_percent',
    GLOBAL_CUDOS_FEES_PERCENT = 'global_cudos_fees_percent',
    GLOBAL_CUDOS_ROYALTIES_PERCENT = 'global_cudos_royalties_percent'
}

@Table({
    freezeTableName: true,
    tableName: SUPER_ADMIN_TABLE_NAME,
    underscored: true,
    timestamps: false,
})
export default class SuperAdminRepo extends Model {

    @Unique
    @PrimaryKey
    @AutoIncrement
    @Column
        superAdminId: number;

    @ForeignKey(() => AccountRepo)
    @Unique
    @AllowNull(false)
    @Column
        accountId: number;

    @AllowNull(false)
    @Column
        cudosRoyalteesAddress: string;

    @AllowNull(false)
    @Column
        firstSaleCudosRoyaltiesPercent: number;

    @AllowNull(false)
    @Column
        resaleCudosRoyaltiesPercent: number;

    @AllowNull(false)
    @Column
        globalCudosFeesPercent: number;

    @AllowNull(false)
    @Column
        globalCudosRoyaltiesPercent: number;

}
