import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CryptoCompareController } from './crypto-compare.controller';
import CryptoCompareService from './crypto-compare.service';
import { EmailModule } from '../email/email.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [
        HttpModule,
        EmailModule,
        LoggerModule,
    ],
    providers: [CryptoCompareService],
    controllers: [CryptoCompareController],
    exports: [CryptoCompareService],
})
export class CryptoCompareModule {}
