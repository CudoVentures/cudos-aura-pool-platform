import {
    Column,
    Model,
    Table,
    AllowNull,
    BelongsTo,
    ForeignKey,
    HasMany,
    PrimaryKey,
    Unique,
    DataType,
    AutoIncrement,
} from 'sequelize-typescript';
import { NFT } from '../nft/nft.model';
import { CollectionStatus } from './utils';
import AccountRepo from '../account/repos/account.repo';
import { MiningFarmRepo } from '../farm/repos/mining-farm.repo';

@Table({
    freezeTableName: true,
    tableName: 'collections',
})
export class Collection extends Model {
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
      denom_id: string;

  @AllowNull(false)
  @Column
      hashing_power: number;

  @AllowNull(false)
  @Column
      royalties: number;

  @AllowNull(false)
  @Column
      main_image: string;

  @AllowNull(false)
  @Column
      banner_image: string;

  @AllowNull(false)
  @Column(DataType.ENUM(
      CollectionStatus.QUEUED,
      CollectionStatus.APPROVED,
      CollectionStatus.DELETED,
  ))
      status: CollectionStatus;

  @Column
  @ForeignKey(() => MiningFarmRepo)
      farm_id: number;

  @BelongsTo(() => MiningFarmRepo)
      farm: MiningFarmRepo;

  @AllowNull(false)
  @Column
  @ForeignKey(() => AccountRepo)
      creator_id: number;

  @BelongsTo(() => AccountRepo)
      creator: AccountRepo;

  @HasMany(() => NFT)
      nfts: NFT[];

  @Column
      deleted_at: Date;
}
