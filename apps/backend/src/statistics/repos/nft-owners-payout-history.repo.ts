import { Column, Model, PrimaryKey, Unique, AutoIncrement, Table, DataType, AllowNull, ForeignKey } from 'sequelize-typescript';
import { NftPayoutHistoryRepo } from './nft-payout-history.repo';

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
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        id: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        time_owned_from: number;

    @Column({ type: DataType.INTEGER })
        time_owned_to: number;

    @Column({ type: DataType.INTEGER })
        total_time_owned: number;

    @AllowNull(false)
    @Column({ type: DataType.FLOAT })
        percent_of_time_owned: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        owner: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        payout_address: string;

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        reward: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => NftPayoutHistoryRepo)
        nft_payout_history_id: number;

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        createdAt: Date;

    @AllowNull(false)
    @Column({ type: DataType.DATE })
        updatedAt: Date;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
        sent: boolean
}
