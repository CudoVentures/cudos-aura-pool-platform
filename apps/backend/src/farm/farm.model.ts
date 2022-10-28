import {
    Column,
    Model,
    Table,
    AllowNull,
    BelongsTo,
    HasMany,
    ForeignKey,
    PrimaryKey,
    Unique,
    AutoIncrement,
    DataType,
} from 'sequelize-typescript';
import { Collection } from '../collection/collection.model';
import { User } from '../user/user.model';

export const enum FarmStatus {
    QUEUED = 'queued',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}
@Table({
    freezeTableName: true,
    tableName: 'farms',
})
export class Farm extends Model {
    @Unique
    @PrimaryKey
    @AutoIncrement
    @Column
        id: number;

    @AllowNull(false)
    @Column
        name: string;

    @Column
        description: string;

    @AllowNull(false)
    @Column
        sub_account_name: string;

    @AllowNull(false)
    @Column
        location: string;

    @AllowNull(false)
    @Column
        address_for_receiving_rewards_from_pool: string;
    // @TODO add default address_for_receiving_rewards_from_pool
    @AllowNull(false)
    @Column
        leftover_reward_payout_address: string;
    // @TODO add default address_for_receiving_rewards_from_pool
    @AllowNull(false)
    @Column
        maintenance_fee_payout_address: string;

    @AllowNull(false)
    @Column
        maintenance_fee_in_btc: number;

    @AllowNull(false)
    @Column
        total_farm_hashrate: number;

    @AllowNull(false)
    @Column({ type: DataType.ARRAY(DataType.STRING) })
        manufacturers: string[];

    @AllowNull(false)
    @Column({ type: DataType.ARRAY(DataType.STRING) })
        miner_types: string[];

    @AllowNull(false)
    @Column({ type: DataType.ARRAY(DataType.STRING) })
        energy_source: string[];

    @AllowNull(false)
    @Column(DataType.ENUM('queued', 'approved', 'rejected'))
        status: FarmStatus;

    @AllowNull(false)
    @Column
    @ForeignKey(() => User)
        creator_id: number;

    @BelongsTo(() => User)
        creator: User;

    @HasMany(() => Collection)
        collections: Collection[];

    @Column
        deleted_at: Date;
}
