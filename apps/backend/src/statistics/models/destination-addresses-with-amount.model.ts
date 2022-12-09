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
import { MiningFarmRepo } from '../../farm/repos/mining-farm.repo';

@Table({
    freezeTableName: true,
    tableName: 'statistics_destination_addresses_with_amount',
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
  @ForeignKey(() => MiningFarmRepo)
      farm_id: number;

  @BelongsTo(() => MiningFarmRepo)
      farm: MiningFarmRepo;

  @AllowNull(false)
  @Column
      time: Date;
}
