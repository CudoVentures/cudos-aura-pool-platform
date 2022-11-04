import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HttpModule } from '@nestjs/axios';
import { NFTModule } from '../nft/nft.module';
import { NFTService } from '../nft/nft.service';
import { DestinationAddressesWithAmount } from './models/destination-addresses-with-amount.model';
import { NftOwnersPayoutHistory } from './models/nft-owners-payout-history.model';
import { NftPayoutHistory } from './models/nft-payout-history.model';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { GraphqlService } from '../graphql/graphql.service';
import { Collection } from '../collection/collection.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      DestinationAddressesWithAmount,
      NftOwnersPayoutHistory,
      NftPayoutHistory,
      Collection,
    ]),
    NFTModule,
    HttpModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService, NFTService, GraphqlService],
})
export class StatisticsModule {}
