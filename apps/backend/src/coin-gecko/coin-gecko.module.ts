import { Module } from '@nestjs/common';
import { CoinGeckoController } from './coin-gecko.controller';
import CoinGeckoService from './coin-gecko.service';

@Module({
    providers: [CoinGeckoService],
    controllers: [CoinGeckoController],
    exports: [CoinGeckoService],
})
export class CoinGeckoModule {}
