import { Module } from '@nestjs/common';
import CoinGeckoService from './coin-gecko.service';

@Module({
    providers: [CoinGeckoService],
    exports: [CoinGeckoService],
})
export class CoinGeckoModule {}
