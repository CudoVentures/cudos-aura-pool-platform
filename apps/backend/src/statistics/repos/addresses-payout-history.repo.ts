import { Column, Model, PrimaryKey, Unique, AutoIncrement, Table, DataType, AllowNull, ForeignKey } from 'sequelize-typescript';
import { NftPayoutHistoryRepo } from './nft-payout-history.repo';

const ADDRESSES_PAYOUT_HISTORY_TABLE_NAME = 'statistics_destination_addresses_with_amount'

export const enum AddressesPayoutHistoryRepoColumn {
    ID = 'id',
    ADDRESS = 'address',
    AMOUNT_BTC = 'amount_btc',
    TX_HASH = 'tx_hash',
    FARM_ID = 'farm_id',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    PAYOUT_TIME = 'payout_time',
    THRESHOLD_REACHED = 'threshold_reached',
}

@Table({
    freezeTableName: true,
    tableName: ADDRESSES_PAYOUT_HISTORY_TABLE_NAME,
})
export class AddressesPayoutHistoryRepo extends Model {

    @Unique
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        id: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        address: string;

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        amount_btc: string;

    @Column({ type: DataType.STRING })
        tx_hash: string;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        farm_id: number;

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        createdAt: Date;

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        updatedAt: Date;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        payout_time: number;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
        threshold_reached: boolean
}
