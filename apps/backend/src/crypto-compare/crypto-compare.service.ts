import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { CURRENCY_DECIMALS } from 'cudosjs';
import { BIG_NUMBER_0, FIFTEEN_MINUTES_IN_MILIS, NOT_EXISTS_INT } from '../common/utils';
import NftEntity from '../nft/entities/nft.entity';
import BitcoinDataEntity from './entities/bitcoin-data.entity';
import CudosDataEntity from './entities/cudos-data.entity';

@Injectable()
export default class CryptoCompareService {

    // static coinGeckoCudosApiUrl = 'https://api.coingecko.com/api/v3/coins/cudos?tickers=false&community_data=false&developer_data=false&sparkline=false';
    // static coinGeckoBitcoinApiUrl = 'https://api.coingecko.com/api/v3/coins/bitcoin?tickers=false&community_data=false&developer_data=false&sparkline=false';
    static cryptoCompareCudosApiUrl = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=CUDOS&tsyms=USD,ETH';
    static cryptoCompareBitcoinApiUrl = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC&tsyms=USD';

    cryptoCompareApiKey: string;
    cachedCudosDataEntity: CudosDataEntity = null;
    cachedBitcoinDataEntity: BitcoinDataEntity = null;
    fetchedCachedCudosDataEntityTimestamp = NOT_EXISTS_INT;
    fetchedCachedBitcoinDataEntityTimestamp = NOT_EXISTS_INT;

    constructor(private configService: ConfigService) {
        this.cryptoCompareApiKey = this.configService.get < string >('APP_CRYPTO_COMPARE_API_KEY') ?? '';
    }

    async fetchCudosData(): Promise < CudosDataEntity > {
        const resultJson = await axios.get(CryptoCompareService.cryptoCompareCudosApiUrl, this.getCryptoCompareRequestHeader());
        // return new CudosDataEntity(resultJson.data.market_data.current_price.usd, resultJson.data.market_data.current_price.eth, resultJson.data.market_data.price_change_24h);
        return new CudosDataEntity(resultJson.data.RAW.CUDOS.USD.PRICE, new BigNumber(resultJson.data.RAW.CUDOS.ETH.PRICE), resultJson.data.RAW.CUDOS.USD.CHANGE24HOUR);
    }

    async fetchBitcoinData(): Promise < BitcoinDataEntity > {
        const resultJson = await axios.get(CryptoCompareService.cryptoCompareBitcoinApiUrl, this.getCryptoCompareRequestHeader());
        // return new BitcoinDataEntity(resultJson.data.market_data.current_price.usd, resultJson.data.market_data.price_change_24h);
        return new BitcoinDataEntity(resultJson.data.RAW.BTC.USD.PRICE, resultJson.data.RAW.BTC.USD.CHANGE24HOUR);
    }

    private getCryptoCompareRequestHeader() {
        if (this.cryptoCompareApiKey === '') {
            return {};
        }

        return {
            headers: {
                'authorization': `Apikey ${this.cryptoCompareApiKey}`,
            },
        }
    }

    async getCachedCudosData(): Promise < CudosDataEntity > {
        if (this.fetchedCachedCudosDataEntityTimestamp + FIFTEEN_MINUTES_IN_MILIS < Date.now() || this.cachedCudosDataEntity === null) {
            this.cachedCudosDataEntity = await this.fetchCudosData();
            this.fetchedCachedCudosDataEntityTimestamp = Date.now();
        }

        return this.cachedCudosDataEntity;
    }

    async getCachedBitcoinData(): Promise < BitcoinDataEntity > {
        if (this.fetchedCachedBitcoinDataEntityTimestamp + FIFTEEN_MINUTES_IN_MILIS < Date.now() || this.cachedBitcoinDataEntity === null) {
            this.cachedBitcoinDataEntity = await this.fetchBitcoinData();
            this.fetchedCachedBitcoinDataEntityTimestamp = Date.now();
        }

        return this.cachedBitcoinDataEntity;
    }

    async getNftPriceInAcudos(nftEntity: NftEntity): Promise < BigNumber > {
        if (nftEntity.isMinted() === true && nftEntity.hasPrice() === true) {
            return nftEntity.acudosPrice;
        }

        if (nftEntity.isMinted() === false && nftEntity.priceUsd !== NOT_EXISTS_INT) {
            const cudosDataEntity = await this.getCachedCudosData();
            return new BigNumber(nftEntity.priceUsd).dividedBy(cudosDataEntity.cudosUsdPrice).shiftedBy(CURRENCY_DECIMALS);
        }

        return BIG_NUMBER_0;
    }

    async getFloorPriceOfNftEntities(nftEntities: NftEntity[]): Promise < BigNumber > {
        let floorPriceInAcudos = null;
        for (let i = nftEntities.length; i-- > 0;) {
            const priceInAcudos = await this.getNftPriceInAcudos(nftEntities[i]);
            if (priceInAcudos.lte(BIG_NUMBER_0)) {
                continue;
            }

            if (floorPriceInAcudos === null || priceInAcudos.lt(floorPriceInAcudos)) {
                floorPriceInAcudos = priceInAcudos;
            }
        }

        return floorPriceInAcudos ?? BIG_NUMBER_0;
    }
}
