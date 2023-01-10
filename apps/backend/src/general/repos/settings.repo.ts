import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table, DataType } from 'sequelize-typescript';

const SETTINGS_TABLE_NAME = 'settings'

export const SETTINGS_REPO_PK = 1;

export const enum SuperAdminRepoColumn {
    ID = 'id',
    FIRST_SALE_CUDOS_ROYALTIES_PERCENT = 'first_sale_cudos_royalties_percent',
    RESALE_CUDOS_ROYALTIES_PERCENT = 'resale_cudos_royalties_percent',
    GLOBAL_CUDOS_FEES_PERCENT = 'global_cudos_fees_percent',
    GLOBAL_CUDOS_ROYALTIES_PERCENT = 'global_cudos_royalties_percent',
    CREATED_AT = 'created_at',
    UPDATED_AT = 'updated_at',
}

@Table({
    freezeTableName: true,
    tableName: SETTINGS_TABLE_NAME,
    underscored: true,
    timestamps: true,
})
export default class SettingsRepo extends Model {

    @Unique
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        id: number;

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

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        createdAt: Date;

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        updatedAt: Date;

}
