import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HttpModule } from '@nestjs/axios';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { CollectionRepo } from './repos/collection.repo';
import { NFTModule } from '../nft/nft.module';
import { NFTService } from '../nft/nft.service';
import { GraphqlService } from '../graphql/graphql.service';
import { NftRepo } from '../nft/repos/nft.repo';
import { FarmService } from '../farm/farm.service';
import { FarmModule } from '../farm/farm.module';
import { VisitorModule } from '../visitor/visitor.module';
import DataService from '../data/data.service';
import { MiningFarmRepo } from '../farm/repos/mining-farm.repo';
import { EnergySourceRepo } from '../farm/repos/energy-source.repo';
import { ManufacturerRepo } from '../farm/repos/manufacturer.repo';
import { MinerRepo } from '../farm/repos/miner.repo';
import AccountService from '../account/account.service';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [
        SequelizeModule.forFeature([CollectionRepo, NftRepo, MiningFarmRepo, MinerRepo, ManufacturerRepo, EnergySourceRepo]),
        forwardRef(() => NFTModule),
        forwardRef(() => FarmModule),
        HttpModule,
        VisitorModule,
    ],
    providers: [CollectionService, NFTService, FarmService, GraphqlService, DataService, AccountService, JwtService],
    controllers: [CollectionController],
    exports: [SequelizeModule, CollectionService, DataService],
})
export class CollectionModule {}
