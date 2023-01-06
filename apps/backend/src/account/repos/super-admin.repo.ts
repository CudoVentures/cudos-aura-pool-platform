import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table, ForeignKey, DataType } from 'sequelize-typescript';
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
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        superAdminId: number;

    @ForeignKey(() => AccountRepo)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        accountId: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        cudosRoyalteesAddress: string;

    @AllowNull(false)
    @Column({ type: DataType.FLOAT })
        firstSaleCudosRoyaltiesPercent: number;

    @AllowNull(false)
    @Column({ type: DataType.FLOAT })
        resaleCudosRoyaltiesPercent: number;

    @AllowNull(false)
    @Column({ type: DataType.FLOAT })
        globalCudosFeesPercent: number;

    @AllowNull(false)
    @Column({ type: DataType.FLOAT })
        globalCudosRoyaltiesPercent: number;

}
