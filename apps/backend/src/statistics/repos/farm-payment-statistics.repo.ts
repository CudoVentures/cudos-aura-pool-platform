import { Column, Model, PrimaryKey, Unique, AutoIncrement, Table, DataType, AllowNull, ForeignKey } from 'sequelize-typescript';
import { MiningFarmRepo } from '../../farm/repos/mining-farm.repo';

const ADDRESSES_PAYOUT_HISTORY_TABLE_NAME = 'farm_payment_statistics'

export const enum FarmPaymentStatisticsRepoColumn {
    ID = 'id',
    FARM_ID = 'farm_id',
    AMOUNT_BTC = 'amount_btc',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

@Table({
    freezeTableName: true,
    tableName: ADDRESSES_PAYOUT_HISTORY_TABLE_NAME,
})
export class FarmPaymentStatisticsRepo extends Model {

    @Unique
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        id: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => MiningFarmRepo)
        farm_id: number;

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        amount_btc: string;

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        createdAt: Date;

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        updatedAt: Date;
}
