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
import { FarmService } from '../farm/farm.service';
import { CollectionService } from '../collection/collection.service';
import { Farm } from '../farm/models/farm.model';
import { EnergySource } from '../farm/models/energy-source.model';
import { Manufacturer } from '../farm/models/manufacturer.model';
import { Miner } from '../farm/models/miner.model';

@Module({
    imports: [
        SequelizeModule.forFeature([
            DestinationAddressesWithAmount,
            NftOwnersPayoutHistory,
            NftPayoutHistory,
            Farm,
            Miner,
            Manufacturer,
            EnergySource,
        ]),
        NFTModule,
        HttpModule,
    ],
    controllers: [StatisticsController],
    providers: [StatisticsService, NFTService, GraphqlService, FarmService, CollectionService],
})
export class StatisticsModule {}
