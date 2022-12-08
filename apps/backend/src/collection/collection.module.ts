import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HttpModule } from '@nestjs/axios';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { Collection } from './collection.model';
import { NFTModule } from '../nft/nft.module';
import { NFTService } from '../nft/nft.service';
import { GraphqlService } from '../graphql/graphql.service';
import { NFT } from '../nft/nft.model';
import { FarmService } from '../farm/farm.service';
import { Farm } from '../farm/models/farm.model';
import { FarmModule } from '../farm/farm.module';
import { EnergySource } from '../farm/models/energy-source.model';
import { Manufacturer } from '../farm/models/manufacturer.model';
import { Miner } from '../farm/models/miner.model';
import { VisitorModule } from '../visitor/visitor.module';
import DataService from '../data/data.service';
import { MiningFarmRepo } from '../farm/repos/mining-farm.repo';

@Module({
    imports: [
        SequelizeModule.forFeature([Collection, NFT, Farm, MiningFarmRepo, Miner, Manufacturer, EnergySource]),
        forwardRef(() => NFTModule),
        forwardRef(() => FarmModule),
        HttpModule,
        VisitorModule,
    ],
    providers: [CollectionService, NFTService, FarmService, GraphqlService, DataService],
    controllers: [CollectionController],
    exports: [SequelizeModule, CollectionService, DataService],
})
export class CollectionModule {}
