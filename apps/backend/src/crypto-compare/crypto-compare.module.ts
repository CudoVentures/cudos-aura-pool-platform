import { Module } from '@nestjs/common';
import { CryptoCompareController } from './crypto-compare.controller';
import CryptoCompareService from './crypto-compare.service';

@Module({
    providers: [CryptoCompareService],
    controllers: [CryptoCompareController],
    exports: [CryptoCompareService],
})
export class CryptoCompareModule {}
