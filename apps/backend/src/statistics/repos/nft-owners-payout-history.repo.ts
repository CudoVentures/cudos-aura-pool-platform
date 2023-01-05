import { Column, Model, PrimaryKey, Unique, AutoIncrement, Table, DataType } from 'sequelize-typescript';

const NFT_OWNERS_PAYOUT_HISTORY_TABLE_NAME = 'statistics_nft_owners_payout_history'

export const enum NftOwnersPayoutHistoryRepoColumn {
    ID = 'id',
    TIME_OWNED_FROM = 'time_owned_from',
    TIME_OWNED_TO = 'time_owned_to',
    TOTAL_TIME_OWNED = 'total_time_owned',
    PERCENT_OF_TIME_OWNED = 'percent_of_time_owned',
    OWNER = 'owner',
    PAYOUT_ADDRESS = 'payout_address',
    REWARD = 'reward',
    NFT_PAYOUT_HISTORY_ID = 'nft_payout_history_id',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    SENT = 'sent',
}

@Table({
    freezeTableName: true,
    tableName: NFT_OWNERS_PAYOUT_HISTORY_TABLE_NAME,
})
export class NftOwnersPayoutHistoryRepo extends Model {

    @Unique
    @PrimaryKey
    @AutoIncrement
    @Column
        id: number;

    @Column
        time_owned_from: number;

    @Column
        time_owned_to: number;

    @Column
        total_time_owned: number;

    @Column({ type: DataType.DOUBLE })
        percent_of_time_owned: number;

    @Column
        owner: string;

    @Column
        payout_address: string;

    @Column({ type: DataType.NUMBER })
        reward: number;

    @Column
        nft_payout_history_id: number;

    @Column
        createdAt: Date;

    @Column
        updatedAt: Date;

    @Column({ type: DataType.BOOLEAN })
        sent: boolean
}
