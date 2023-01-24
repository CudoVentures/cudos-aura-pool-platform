import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NFTService } from './nft.service';
import { NFTController } from './nft.controller';
import { NftRepo } from './repos/nft.repo';
import { GraphqlModule } from '../graphql/graphql.module';
import { CollectionModule } from '../collection/collection.module';
import { VisitorModule } from '../visitor/visitor.module';
import { FarmModule } from '../farm/farm.module';
import { CoinGeckoModule } from '../coin-gecko/coin-gecko.module';

@Module({
    imports: [
        SequelizeModule.forFeature([NftRepo]),
        VisitorModule,
        forwardRef(() => GraphqlModule),
        forwardRef(() => CollectionModule),
        forwardRef(() => FarmModule),
        CoinGeckoModule,
    ],
    providers: [NFTService],
    controllers: [NFTController],
    exports: [NFTService],
})
export class NFTModule {}
