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

@Module({
    imports: [
        SequelizeModule.forFeature([Collection, NFT]),
        forwardRef(() => NFTModule),
        HttpModule,
    ],
    providers: [CollectionService, NFTService, GraphqlService],
    controllers: [CollectionController],
    exports: [SequelizeModule],
})
export class CollectionModule {}
