import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CoinGeckoModule } from '../coin-gecko/coin-gecko.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import KycRepo from './repo/kyc.repo';

@Module({
    imports: [
        SequelizeModule.forFeature([KycRepo]),
        forwardRef(() => StatisticsModule),
        CoinGeckoModule,
    ],
    providers: [KycService],
    controllers: [KycController],
    exports: [KycService],
})
export class KycModule {}
