import { Controller, HttpCode, Post, Req, UseInterceptors } from '@nestjs/common';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import CoinGeckoService from './coin-gecko.service';
import { ResFetchBitcoinData, ResFetchCudosData } from './dto/responses.dto';

@Controller('coin-gecko')
export class CoinGeckoController {

    constructor(private coinGeckoService: CoinGeckoService) {}

    @Post('fetchCudosData')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    async fetchCudosData(
        @Req() req: AppRequest,
    ): Promise < ResFetchCudosData > {
        const cudosPriceEntity = await this.coinGeckoService.getCachedCudosData();
        return new ResFetchCudosData(cudosPriceEntity);
    }

    @Post('fetchBitcoinData')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    async fetchBitcoinData(
        @Req() req: AppRequest,
    ): Promise < ResFetchBitcoinData > {
        const bitcoinPriceEntity = await this.coinGeckoService.getCachedBitcoinData();
        return new ResFetchBitcoinData(bitcoinPriceEntity);
    }

}
