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
import { Farm } from '../farm/models/farm.model';
import { EnergySource } from '../farm/models/energy-source.model';
import { Manufacturer } from '../farm/models/manufacturer.model';
import { Miner } from '../farm/models/miner.model';
import { CollectionService } from '../collection/collection.service';
import { VisitorService } from '../visitor/visitor.service';
import { VisitorModule } from '../visitor/visitor.module';
import VisitorRepo from '../visitor/visitor.repo';

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
            VisitorRepo,
        ]),
        NFTModule,
        VisitorModule,
        HttpModule,
    ],
    controllers: [StatisticsController],
    providers: [StatisticsService, NFTService, GraphqlService, CollectionService, VisitorService, FarmService],
    exports: [StatisticsService, NFTService, GraphqlService, CollectionService, VisitorService],
})
export class StatisticsModule {}
