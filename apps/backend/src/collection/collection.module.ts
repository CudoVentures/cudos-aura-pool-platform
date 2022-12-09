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
import { Farm } from '../farm/models/farm.model';
import { FarmModule } from '../farm/farm.module';
import { EnergySource } from '../farm/models/energy-source.model';
import { Manufacturer } from '../farm/models/manufacturer.model';
import { Miner } from '../farm/models/miner.model';
import { VisitorModule } from '../visitor/visitor.module';
import DataService from '../data/data.service';

@Module({
    imports: [
        SequelizeModule.forFeature([CollectionRepo, NftRepo, Farm, Miner, Manufacturer, EnergySource]),
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
