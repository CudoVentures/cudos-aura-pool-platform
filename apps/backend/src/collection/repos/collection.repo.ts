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
import { Farm } from '../../farm/models/farm.model';

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
  @ForeignKey(() => Farm)
      farmId: number;

  @AllowNull(false)
  @Column
  @ForeignKey(() => AccountRepo)
      creatorId: number;

  @Column
      deletedAt: Date;
}
