import {
    Column,
    Model,
    Table,
    BelongsTo,
    ForeignKey,
    PrimaryKey,
    Unique,
    IsDate,
    AllowNull,
    DataType,
    IsUUID,
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { Collection } from '../collection/collection.model';
import { NftStatus } from './utils';

@Table({
    freezeTableName: true,
    tableName: 'nfts',
})
export class NFT extends Model {
  @PrimaryKey
  @Unique
  @IsUUID(4)
  @Column({
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
  })
      id: string;

  @AllowNull(false)
  @Column
      name: string;

  @Column
      uri: string;

  @Column
      data: string;

  @AllowNull(false)
  @Column
      hashing_power: number;

  @AllowNull(false)
  @Column
      price: number;

  @AllowNull(false)
  @IsDate
  @Column
      expiration_date: Date;

  @AllowNull(false)
  @Column(DataType.ENUM('queued', 'approved', 'rejected', 'expired', 'deleted'))
      status: NftStatus;

  @AllowNull(true)
  @Column
      token_id: string

  @Column
  @ForeignKey(() => Collection)
      collection_id: number;

  @BelongsTo(() => Collection)
      collection: Collection;

  @AllowNull(false)
  @Column
  @ForeignKey(() => User)
      creator_id: number;

  @BelongsTo(() => User)
      creator: User;

  @Column
      deleted_at: Date;
}
