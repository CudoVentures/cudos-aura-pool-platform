import { Column, Model, PrimaryKey, Unique, AutoIncrement, Table, DataType, AllowNull } from 'sequelize-typescript';

const NFT_PAYOUT_HISTORY_TABLE_NAME = 'statistics_nft_payout_history'

export const enum NftPayoutHistoryRepoColumn {
    ID = 'id',
    TOKEN_ID = 'token_id',
    DENOM_ID = 'denom_id',
    PAYOUT_PERIOD_START = 'payout_period_start',
    PAYOUT_PERIOD_END = 'payout_period_end',
    REWARD = 'reward',
    TX_HASH = 'tx_hash',
    MAINTENANCE_FEE = 'maintenance_fee',
    CUDO_PART_OF_MAINTENANCE_FEE = 'cudo_part_of_maintenance_fee',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

@Table({
    freezeTableName: true,
    tableName: NFT_PAYOUT_HISTORY_TABLE_NAME,
})
export class NftPayoutHistoryRepo extends Model {

    @Unique
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        id: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        token_id: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        denom_id: string;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        payout_period_start: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        payout_period_end: number;

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        reward: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        tx_hash: string;

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        maintenance_fee: number;

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        cudo_part_of_maintenance_fee: number

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        createdAt: Date;

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        updatedAt: Date;
}
