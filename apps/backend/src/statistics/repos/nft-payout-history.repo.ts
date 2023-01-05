import { Column, Model, PrimaryKey, Unique, AutoIncrement, Table, DataType } from 'sequelize-typescript';

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
    @Column
        id: number;

    @Column
        token_id: number;

    @Column
        denom_id: string;

    @Column
        payout_period_start: number;

    @Column
        payout_period_end: number;

    @Column({ type: DataType.NUMBER })
        reward: number;

    @Column
        tx_hash: string;

    @Column({ type: DataType.NUMBER })
        maintenance_fee: number;

    @Column({ type: DataType.NUMBER })
        cudo_part_of_maintenance_fee: number

    @Column
        createdAt: Date;

    @Column
        updatedAt: Date;
}
