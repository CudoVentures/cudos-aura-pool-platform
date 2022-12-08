import { Column, Model, AllowNull, PrimaryKey, Unique, AutoIncrement, Table, DataType, ForeignKey } from 'sequelize-typescript';
import AccountRepo from '../../account/repos/account.repo';
import { FarmStatus } from '../farm.types';

const MININIG_FARM_TABLE_NAME = 'farms'

export const enum MiningFarmRepoColumn {
    ID = 'id',
    NAME = 'name',
    DESCRIPTION = 'description',
    SUB_ACCOUNT_NAME = 'sub_account_name',
    location = 'location',
    PRIMARY_ACCOUNT_OWNER_NAME = 'primary_account_owner_name',
    PRIMARY_ACCOUNT_OWNER_EMAIL = 'primary_account_owner_email',
    CUDOS_MINT_NFT_ROYALTIES_PERCENT = 'cudos_mint_nft_royalties_percent',
    CUDOS_RESALE_NFT_ROYALTIES_PERCENT = 'cudos_resale_nft_royalties_percent',
    RESALE_FARM_ROYALTIES_CUDOS_ADDRESS = 'resale_farm_royalties_cudos_address',
    ADDRESS_FOR_RECEIVING_REWARDS_FROM_POOL = 'address_for_receiving_rewards_from_pool',
    LEFTOVER_REWARD_PAYOUT_ADDRESS = 'leftover_reward_payout_address',
    MAINTENANCE_FEE_PAYOUT_ADDRESS = 'maintenance_fee_payout_address',
    MAINTENANCE_FEE_IN_BTC = 'maintenance_fee_in_btc',
    TOTAL_FARM_HASHRATE = 'total_farm_hashrate',
    MANUFACTURERS = 'manufacturers',
    MINER_TYPES = 'miner_types',
    ENERGY_SOURCE = 'energy_source',
    IMAGES = 'images',
    COVER_IMG = 'cover_img',
    PROFILE_IMG = 'profile_img',
    STATUS = 'status',
    CREATOR_ID = 'creator_id',
    CREATE_AT = 'created_at',
    UPDATED_AT = 'updated_at',
    DELETED_AT = 'deleted_at',
}

@Table({
    freezeTableName: true,
    tableName: MININIG_FARM_TABLE_NAME,
    underscored: true,
})
export class MiningFarmRepo extends Model {

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
        subAccountName: string;

    @AllowNull(false)
    @Column
        location: string;

    @AllowNull(false)
    @Column
        primaryAccountOwnerName: string;

    @AllowNull(false)
    @Column
        primaryAccountOwnerEmail: string;

    @AllowNull(false)
    @Column
        cudosMintNftRoyaltiesPercent: number;

    @AllowNull(false)
    @Column
        cudosResaleNftRoyaltiesPercent: number;

    @AllowNull(false)
    @Column
        resaleFarmRoyaltiesCudosAddress: string;

    @AllowNull(false)
    @Column
        addressForReceivingRewardsFromPool: string;

    @AllowNull(false)
    @Column
        leftoverRewardPayoutAddress: string;

    @AllowNull(false)
    @Column
        maintenanceFeePayoutAddress: string;

    @AllowNull(false)
    @Column
        maintenanceFeeInBtc: string;

    @AllowNull(false)
    @Column
        totalFarmHashrate: number;

    @AllowNull(false)
    @Column({ type: DataType.ARRAY(DataType.STRING) })
        manufacturers: string[];

    @AllowNull(false)
    @Column({ type: DataType.ARRAY(DataType.STRING) })
        minerTypes: string[];

    @AllowNull(false)
    @Column({ type: DataType.ARRAY(DataType.STRING) })
        energySource: string[];

    @AllowNull(false)
    @Column({ type: DataType.ARRAY(DataType.STRING) })
        images: string[];

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        coverImg: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        profileImg: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        status: FarmStatus;

    @AllowNull(false)
    @Column
    @ForeignKey(() => AccountRepo)
        creatorId: number;

    @AllowNull(false)
    @Column
        createdAt: Date;

    @AllowNull(false)
    @Column
        updatedAt: Date;

    @Column
        deletedAt: Date;
}
