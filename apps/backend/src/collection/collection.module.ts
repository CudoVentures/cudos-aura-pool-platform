import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HttpModule } from '@nestjs/axios';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { Collection } from './collection.model';
import { NFTModule } from '../nft/nft.module';
import { NFTService } from '../nft/nft.service';
import { GraphqlService } from '../graphql/graphql.service';
import { FarmService } from '../farm/farm.service';
import { Farm } from '../farm/farm.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Collection]),
    SequelizeModule.forFeature([Farm]),
    forwardRef(() => NFTModule),
    HttpModule,
  ],
  providers: [CollectionService, NFTService, GraphqlService, FarmService],
  controllers: [CollectionController],
  exports: [SequelizeModule],
})
export class CollectionModule {}
