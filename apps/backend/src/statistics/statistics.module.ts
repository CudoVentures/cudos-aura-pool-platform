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
import { VisitorService } from '../visitor/visitor.service';
import { VisitorModule } from '../visitor/visitor.module';
import VisitorRepo from '../visitor/repo/visitor.repo';
import DataService from '../data/data.service';
import { MiningFarmRepo } from '../farm/repos/mining-farm.repo';
import { EnergySourceRepo } from '../farm/repos/energy-source.repo';
import { MinerRepo } from '../farm/repos/miner.repo';
import { ManufacturerRepo } from '../farm/repos/manufacturer.repo';
import AccountService from '../account/account.service';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [
        SequelizeModule.forFeature([
            DestinationAddressesWithAmount,
            NftOwnersPayoutHistory,
            NftPayoutHistory,
            MiningFarmRepo,
            MinerRepo,
            ManufacturerRepo,
            EnergySourceRepo,
            VisitorRepo,
        ]),
        NFTModule,
        VisitorModule,
        HttpModule,
    ],
    controllers: [StatisticsController],
    providers: [StatisticsService, NFTService, GraphqlService, CollectionService, VisitorService, DataService, FarmService, AccountService, JwtService],
    exports: [StatisticsService, NFTService, GraphqlService, CollectionService, VisitorService, DataService],
})
export class StatisticsModule {}
