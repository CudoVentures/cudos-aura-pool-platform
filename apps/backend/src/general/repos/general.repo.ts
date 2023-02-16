import { Column, Model, Table, AllowNull, PrimaryKey, Unique, AutoIncrement, DataType } from 'sequelize-typescript';

const GENERAL_TABLE_NAME = 'general';

export const GENERAL_REPO_PK = 1;

export const enum GeneralRepoColumn {
    ID = 'id',
    LAST_CHECKED_BLOCK = 'last_checked_block',
    LAST_CHECKED_PAYMENT_RELAYER_ETH_BLOCK = 'last_checked_payment_relayer_eth_block',
    LAST_CHECKED_PAYMENT_RELAYER_CUDOS_BLOCK = 'last_checked_payment_relayer_cudos_block',
    UPDATED_AT = 'updated_at',
}

@Table({
    freezeTableName: true,
    tableName: GENERAL_TABLE_NAME,
    underscored: true,
})
export class GeneralRepo extends Model {
    @Unique
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        id: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        lastCheckedBlock: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        lastCheckedPaymentRelayerEthBlock: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        lastCheckedPaymentRelayerCudosBlock: number;

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        updatedAt: Date;
}
