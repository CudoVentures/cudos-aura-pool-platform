import { Controller, HttpCode, Post, Req, UseInterceptors } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { TransactionInterceptor } from '../common/common.interceptors';
import { AppRequest } from '../common/commont.types';
import CryptoCompareService from './crypto-compare.service';
import { ResFetchBitcoinData, ResFetchCudosData } from './dto/responses.dto';

@Controller('crypto-compare')
export class CryptoCompareController {

    constructor(private cryptoCompareService: CryptoCompareService) {}

    @Post('fetchCudosData')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @Throttle(20, 30)
    async fetchCudosData(
        @Req() req: AppRequest,
    ): Promise < ResFetchCudosData > {
        const cudosPriceEntity = await this.cryptoCompareService.getCachedCudosData();
        return new ResFetchCudosData(cudosPriceEntity);
    }

    @Post('fetchBitcoinData')
    @UseInterceptors(TransactionInterceptor)
    @HttpCode(200)
    @Throttle(20, 30)
    async fetchBitcoinData(
        @Req() req: AppRequest,
    ): Promise < ResFetchBitcoinData > {
        const bitcoinPriceEntity = await this.cryptoCompareService.getCachedBitcoinData();
        return new ResFetchBitcoinData(bitcoinPriceEntity);
    }

}
