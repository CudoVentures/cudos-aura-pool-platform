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
import AccountRepo from '../../account/repos/account.repo';
import { CollectionRepo } from '../../collection/repos/collection.repo';

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
        primary_account_owner_name: string;

    @AllowNull(false)
    @Column
        primary_account_owner_email: string;

    @AllowNull(false)
    @Column
        cudos_mint_nft_royalties_percent: number;

    @AllowNull(false)
    @Column
        cudos_resale_nft_royalties_percent: number;

    @AllowNull(false)
    @Column
        resale_farm_royalties_cudos_address: string;

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
        maintenance_fee_in_btc: string;

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
    @Column({ type: DataType.ARRAY(DataType.STRING) })
        images: string[];

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        cover_img: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        profile_img: string;

    @AllowNull(false)
    @Column(DataType.ENUM('queued', 'approved', 'rejected'))
        status: FarmStatus;

    @AllowNull(false)
    @Column
    @ForeignKey(() => AccountRepo)
        creator_id: number;

    @BelongsTo(() => AccountRepo)
        creator: AccountRepo;

    @HasMany(() => CollectionRepo)
        collections: CollectionRepo[];

    @Column
        deleted_at: Date;
}
