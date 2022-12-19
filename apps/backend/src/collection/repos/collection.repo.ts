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
  @Column
      id: number;

  @AllowNull(false)
  @Column
      name: string;

  @Column
      description: string;

  @AllowNull(false)
  @Column
      denomId: string;

  @AllowNull(false)
  @Column
      hashingPower: number;

  @AllowNull(false)
  @Column
      royalties: number;

  @AllowNull(false)
  @Column
      mainImage: string;

  @AllowNull(false)
  @Column
      bannerImage: string;

  @AllowNull(false)
  @Column(DataType.ENUM(
      CollectionStatus.QUEUED,
      CollectionStatus.APPROVED,
      CollectionStatus.DELETED,
  ))
      status: CollectionStatus;

  @Column
  @ForeignKey(() => MiningFarmRepo)
      farmId: number;

  @AllowNull(false)
  @Column
  @ForeignKey(() => AccountRepo)
      creatorId: number;

  @Column
      deletedAt: Date;
}
