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
import { CryptoCompareModule } from '../crypto-compare/crypto-compare.module';
import { HttpModule } from '@nestjs/axios';

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
        CryptoCompareModule,
        forwardRef(() => FarmModule),
        forwardRef(() => StatisticsModule),
        HttpModule,
    ],
    providers: [CollectionService],
    controllers: [CollectionController],
    exports: [CollectionService],
})
export class CollectionModule {}
