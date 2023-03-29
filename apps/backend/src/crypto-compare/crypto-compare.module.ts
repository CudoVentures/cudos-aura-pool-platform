import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CryptoCompareController } from './crypto-compare.controller';
import CryptoCompareService from './crypto-compare.service';

@Module({
    imports: [HttpModule],
    providers: [CryptoCompareService],
    controllers: [CryptoCompareController],
    exports: [CryptoCompareService],
})
export class CryptoCompareModule {}
