import { Column, Model, PrimaryKey, Unique, AutoIncrement, Table, DataType, AllowNull, ForeignKey } from 'sequelize-typescript';
import { CollectionRepo } from '../../collection/repos/collection.repo';
import { MiningFarmRepo } from '../../farm/repos/mining-farm.repo';
import { FarmPaymentStatisticsRepo } from './farm-payment-statistics.repo';

const ADDRESSES_PAYOUT_HISTORY_TABLE_NAME = 'collection_payment_allocations'

export const enum CollectionPaymentAllocationRepoColumn {
    ID = 'id',
    FARM_ID = 'farm_id',
    FARM_PAYMENT_ID = 'farm_payment_id',
    COLLECTION_ID = 'collection_id',
    COLLECTION_ALLOCATION_AMOUNT_BTC = 'collection_allocation_amount_btc',
    CUDO_GENERAL_FEE_BTC = 'cudo_general_fee_btc',
    CUDO_MAINTENANCE_FEE_BTC = 'cudo_maintenance_fee_btc',
    FARM_UNSOLD_LEFTOVER_BTC = 'farm_unsold_leftover_btc',
    FARM_MAINTENANCE_FEE_BTC = 'farm_maintenance_fee_btc',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

@Table({
    freezeTableName: true,
    tableName: ADDRESSES_PAYOUT_HISTORY_TABLE_NAME,
})
export class CollectionPaymentAllocationRepo extends Model {

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
    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => FarmPaymentStatisticsRepo)
        farm_payment_id: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => CollectionRepo)
        collection_id: number;

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        collection_allocation_amount_btc: string

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        cudo_general_fee_btc: string

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        cudo_maintenance_fee_btc: string

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        farm_unsold_leftover_btc: string

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        farm_maintenance_fee_btc: string

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        createdAt: Date;

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        updatedAt: Date;
}
