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
import { Collection } from '../collection/collection.model';
import { VisitorModule } from '../visitor/visitor.module';

@Module({
    imports: [
        SequelizeModule.forFeature([NFT, Collection]),
        HttpModule,
        GraphqlModule,
        VisitorModule,
        forwardRef(() => CollectionModule),
    ],
    providers: [NFTService, GraphqlService, CollectionService],
    controllers: [NFTController],
    exports: [SequelizeModule],
})
export class NFTModule {}
