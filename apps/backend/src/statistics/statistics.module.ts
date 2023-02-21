import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NFTModule } from '../nft/nft.module';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { NftOwnersPayoutHistoryRepo } from './repos/nft-owners-payout-history.repo';
import { NftPayoutHistoryRepo } from './repos/nft-payout-history.repo';
import { FarmModule } from '../farm/farm.module';
import { CollectionModule } from '../collection/collection.module';
import { GraphqlModule } from '../graphql/graphql.module';
import { ConfigModule } from '@nestjs/config';
import { AddressesPayoutHistoryRepo } from './repos/addresses-payout-history.repo';
import { CollectionPaymentAllocationRepo } from './repos/collection-payment-allocation.repo';

@Module({
    imports: [
        SequelizeModule.forFeature([
            NftOwnersPayoutHistoryRepo,
            NftPayoutHistoryRepo,
            AddressesPayoutHistoryRepo,
            CollectionPaymentAllocationRepo,
        ]),
        forwardRef(() => NFTModule),
        forwardRef(() => CollectionModule),
        forwardRef(() => FarmModule),
        forwardRef(() => GraphqlModule),
        forwardRef(() => ConfigModule),
    ],
    controllers: [StatisticsController],
    providers: [StatisticsService],
    exports: [StatisticsService],
})
export class StatisticsModule {}
