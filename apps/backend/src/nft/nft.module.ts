import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NFTService } from './nft.service';
import { NFTController } from './nft.controller';
import { NFT } from './nft.model';
import { HttpModule } from '@nestjs/axios';
import { GraphqlModule } from '../graphql/graphql.module';
import { GraphqlService } from '../graphql/graphql.service';
import { CollectionService } from '../collection/collection.service';
import { CollectionModule } from '../collection/collection.module';
import { FarmService } from '../farm/farm.service';

@Module({
  imports: [
    SequelizeModule.forFeature([NFT]),
    HttpModule,
    GraphqlModule,
    forwardRef(() => CollectionModule),
  ],
  providers: [NFTService, GraphqlService, CollectionService, FarmService],
  controllers: [NFTController],
  exports: [SequelizeModule],
})
export class NFTModule {}
