import {
    Column,
    Model,
    Table,
    AllowNull,
    HasMany,
    Unique,
    PrimaryKey,
    IsEmail,
    AutoIncrement,
    DataType,
} from 'sequelize-typescript';
import { Collection } from '../collection/collection.model';
import { NFT } from '../nft/nft.model';
import { Farm } from '../farm/models/farm.model';

@Table({
    freezeTableName: true,
    tableName: 'users',
})
export class User extends Model {
  @PrimaryKey
  @Unique
  @AutoIncrement
  @Column
      id: number;

  @Unique
  @AllowNull(false)
  @IsEmail
  @Column
      email: string;

  @AllowNull(false)
  @Column
      name: string;

  @Unique
  @AllowNull(false)
  @Column
      salt: string;

  @AllowNull(false)
  @Unique
  @Column
      hashed_pass: string;

  @AllowNull(false)
  @Column(DataType.ENUM('super_admin', 'farm_admin'))
      role: string;

  @Column
      cudos_address: string;

  @Column
      payout_address: string;

  @Column
      is_active: boolean;

  @Column
      email_verified: boolean;

  @HasMany(() => Farm)
      farms: Farm[];

  @HasMany(() => Collection)
      collections: Collection[];

  @HasMany(() => NFT)
      nfts: NFT[];
}
