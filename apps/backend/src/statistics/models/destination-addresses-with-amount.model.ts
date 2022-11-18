import {
    Column,
    Model,
    Table,
    BelongsTo,
    ForeignKey,
    PrimaryKey,
    Unique,
    AllowNull,
} from 'sequelize-typescript';
import { Farm } from '../../farm/models/farm.model';

@Table({
    freezeTableName: true,
    tableName: 'statistics_destination_address_with_amount',
})
export class DestinationAddressesWithAmount extends Model {
  @PrimaryKey
  @Unique
  @Column
      id: number;

  @AllowNull(false)
  @Column
      address: string;

  @AllowNull(false)
  @Column
      amount: string;

  @AllowNull(false)
  @Column
      tx_hash: string;

  @AllowNull(false)
  @Column
  @ForeignKey(() => Farm)
      farm_id: number;

  @BelongsTo(() => Farm)
      farm: Farm;

  @AllowNull(false)
  @Column
      time: Date;
}
