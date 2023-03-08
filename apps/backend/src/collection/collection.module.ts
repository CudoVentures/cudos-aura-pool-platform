import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { CollectionRepo } from './repos/collection.repo';
import { NFTModule } from '../nft/nft.module';
import { NftRepo } from '../nft/repos/nft.repo';
import { GraphqlModule } from '../graphql/graphql.module';
import { AccountModule } from '../account/account.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { FarmModule } from '../farm/farm.module';
import { DataModule } from '../data/data.module';
import { CoinGeckoModule } from '../coin-gecko/coin-gecko.module';

@Module({
    imports: [
        SequelizeModule.forFeature([
            CollectionRepo,
            NftRepo,
        ]),
        forwardRef(() => NFTModule),
        GraphqlModule,
        AccountModule,
        DataModule,
        GraphqlModule,
        CoinGeckoModule,
        forwardRef(() => FarmModule),
        forwardRef(() => StatisticsModule),
    ],
    providers: [CollectionService],
    controllers: [CollectionController],
    exports: [CollectionService],
})
export class CollectionModule {}
