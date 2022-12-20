import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CollectionModule } from '../collection/collection.module';
import { CollectionService } from '../collection/collection.service';
import { NFTModule } from '../nft/nft.module';
import { NFTService } from '../nft/nft.service';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';
import { HttpModule } from '@nestjs/axios';
import { GraphqlService } from '../graphql/graphql.service';
import { VisitorService } from '../visitor/visitor.service';
import { VisitorModule } from '../visitor/visitor.module';
import VisitorRepo from '../visitor/repo/visitor.repo';
import DataService from '../data/data.service';
import { MiningFarmRepo } from './repos/mining-farm.repo';
import { EnergySourceRepo } from './repos/energy-source.repo';
import { ManufacturerRepo } from './repos/manufacturer.repo';
import { MinerRepo } from './repos/miner.repo';
import AccountService from '../account/account.service';
import { JwtService } from '@nestjs/jwt';
import { StatisticsService } from '../statistics/statistics.service';

@Module({
    imports: [SequelizeModule.forFeature([MiningFarmRepo, EnergySourceRepo, MinerRepo, ManufacturerRepo, VisitorRepo]), forwardRef(() => CollectionModule), NFTModule, HttpModule, VisitorModule],
    controllers: [FarmController],
    providers: [FarmService, CollectionService, NFTService, VisitorService, GraphqlService, DataService, AccountService, JwtService, StatisticsService],
    exports: [VisitorService],
})
export class FarmModule {}
