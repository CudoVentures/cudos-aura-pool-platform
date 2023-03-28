import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CryptoCompareModule } from '../crypto-compare/crypto-compare.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import KycRepo from './repo/kyc.repo';

@Module({
    imports: [
        SequelizeModule.forFeature([KycRepo]),
        forwardRef(() => StatisticsModule),
        CryptoCompareModule,
    ],
    providers: [KycService],
    controllers: [KycController],
    exports: [KycService],
})
export class KycModule {}
