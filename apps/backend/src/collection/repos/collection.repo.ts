import {
    Column,
    Model,
    Table,
    AllowNull,
    ForeignKey,
    PrimaryKey,
    Unique,
    DataType,
    AutoIncrement,
} from 'sequelize-typescript';
import { CollectionStatus } from '../utils';
import AccountRepo from '../../account/repos/account.repo';
import { MiningFarmRepo } from '../../farm/repos/mining-farm.repo';

export const enum CollectionRepoColumn {
    ID = 'id',
    NAME = 'name',
    DESCRIPTION = 'description',
    DENOM_ID = 'denom_id',
    HASHING_POWER = 'hashing_power',
    ROYALTIES = 'royalties',
    STATUS = 'status',
    MAIN_IMAGE = 'main_image',
    BANNER_IMAGE = 'banner_image',
    FARM_ID = 'farm_id',
    CREATOR_ID = 'creator_id',
    DELETE_AT = 'deleted_at',
    CREATE_AT = 'created_at',
    UPDATED_AT = 'updated_at',
}

@Table({
    freezeTableName: true,
    tableName: 'collections',
    underscored: true,
})
export class CollectionRepo extends Model {
    @Unique
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
        id: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        name: string;

    @Column({ type: DataType.STRING })
        description: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
        denomId: string;

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        hashingPower: string;

    @AllowNull(false)
    @Column({ type: DataType.DECIMAL })
        royalties: string;

    @AllowNull(true)
    @Column({ type: DataType.TEXT })
        mainImage: string;

    @AllowNull(true)
    @Column({ type: DataType.TEXT })
        bannerImage: string;

    @Column({ type: DataType.ENUM(CollectionStatus.QUEUED, CollectionStatus.APPROVED, CollectionStatus.DELETED, CollectionStatus.REJECTED) })
        status: CollectionStatus;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => MiningFarmRepo)
        farmId: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => AccountRepo)
        creatorId: number;

    @Column({ type: DataType.DATE })
        deletedAt: Date;

    @Column({ type: DataType.DATE })
        updatedAt: Date;
}
