import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import BigNumber from 'bignumber.js';
import { CURRENCY_DECIMALS } from 'cudosjs';
import { BIG_NUMBER_0, FIVE_MINUTES_IN_MILIS, NOT_EXISTS_INT } from '../common/utils';
import NftEntity from '../nft/entities/nft.entity';
import BitcoinDataEntity from './entities/bitcoin-data.entity';
import CudosDataEntity from './entities/cudos-data.entity';
import EmailService from '../email/email.service';
import { AxiosResponse } from 'axios';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export default class CryptoCompareService {

    static cryptoCompareCudosApiUrl = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=CUDOS&tsyms=USD,ETH';
    static cryptoCompareBitcoinApiUrl = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC&tsyms=USD';

    cryptoCompareApiKey: string;
    cryptoComparePaidApiKey: string;
    cryptoCompareFreeApiKey: string;

    cachedCudosDataEntity: CudosDataEntity = null;
    fetchedCachedCudosDataEntityTimestamp = NOT_EXISTS_INT;
    fetchingCudosDataCallbacks: ((e: Error) => void)[] = [];

    cachedBitcoinDataEntity: BitcoinDataEntity = null;
    fetchedCachedBitcoinDataEntityTimestamp = NOT_EXISTS_INT;
    fetchingBitcoinDataCallbacks: ((e: Error) => void)[] = [];

    constructor(
        private configService: ConfigService,
        private readonly httpService: HttpService,
        private emailService: EmailService,
        private loggerService: LoggerService,
    ) {
        this.cryptoCompareApiKey = this.cryptoComparePaidApiKey = this.configService.get < string >('APP_CRYPTO_COMPARE_PAID_API_KEY') ?? '';
        this.cryptoCompareFreeApiKey = this.configService.get < string >('APP_CRYPTO_COMPARE_FREE_API_KEY') ?? '';
    }

    async getCachedCudosData(): Promise < CudosDataEntity > {
        await this.invalidateCudosData();
        return this.cachedCudosDataEntity;
    }

    async getCachedBitcoinData(): Promise < BitcoinDataEntity > {
        await this.invalidateBitcoinData();
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

    // private but cannot use annotation, because of the tests
    async fetchCudosData(): Promise < CudosDataEntity > {
        this.loggerService.info(`Making request for cudos to crypto-compare using paid api: ${this.cryptoComparePaidApiKey === this.cryptoCompareApiKey}`);
        const axiosRes = await this.httpService.axiosRef.get(CryptoCompareService.cryptoCompareCudosApiUrl, this.getCryptoCompareRequestHeader());
        this.invalidateCryptoCompareApiKey(axiosRes);
        return new CudosDataEntity(axiosRes.data.RAW.CUDOS.USD.PRICE, new BigNumber(axiosRes.data.RAW.CUDOS.ETH.PRICE), axiosRes.data.RAW.CUDOS.USD.CHANGE24HOUR);
    }

    // private but cannot use annotation, because of the tests
    async fetchBitcoinData(): Promise < BitcoinDataEntity > {
        this.loggerService.info(`Making request for bitcoin to crypto-compare using paid api: ${this.cryptoComparePaidApiKey === this.cryptoCompareApiKey}`);
        const axiosRes = await this.httpService.axiosRef.get(CryptoCompareService.cryptoCompareBitcoinApiUrl, this.getCryptoCompareRequestHeader());
        this.invalidateCryptoCompareApiKey(axiosRes);
        return new BitcoinDataEntity(axiosRes.data.RAW.BTC.USD.PRICE, axiosRes.data.RAW.BTC.USD.CHANGE24HOUR);
    }

    private invalidateCryptoCompareApiKey(axiosRes: AxiosResponse) {
        const xRateLimitRemainingString = axiosRes.headers['x-ratelimit-remaining'];
        if (Number.isNaN(xRateLimitRemainingString) === false) {
            const xRateLimitRemaining = parseInt(xRateLimitRemainingString);
            if (xRateLimitRemaining < 600000) {
                this.cryptoCompareApiKey = this.cryptoCompareFreeApiKey;
                this.loggerService.info('Switching to crypto-compare free api key');
                this.emailService.sendCryptoCompareApiWarningEmail(xRateLimitRemainingString);
            }
        }
    }

    private invalidateCudosData(): Promise < void > {
        return new Promise < void >((resolve, reject) => {
            const promiseRun = async () => {
                if (this.fetchedCachedCudosDataEntityTimestamp + FIVE_MINUTES_IN_MILIS >= Date.now() && this.cachedCudosDataEntity !== null) {
                    resolve();
                    return;
                }

                const onResolve = (error) => {
                    if (error === null) {
                        resolve();
                    } else {
                        reject(error);
                    }
                };

                if (this.fetchingCudosDataCallbacks.length === 0) {
                    this.fetchingCudosDataCallbacks.push(onResolve);

                    let cudosDataEntity: CudosDataEntity;
                    let error;
                    try {
                        cudosDataEntity = await this.fetchCudosData();
                        error = null;
                    } catch (e) {
                        cudosDataEntity = null;
                        error = e;
                    }

                    if (cudosDataEntity !== null) {
                        this.cachedCudosDataEntity = cudosDataEntity;
                        this.fetchedCachedCudosDataEntityTimestamp = Date.now();
                    }

                    this.fetchingCudosDataCallbacks.forEach((callback) => {
                        callback(error);
                    });
                    this.fetchingCudosDataCallbacks = [];
                } else {
                    this.fetchingCudosDataCallbacks.push(onResolve);
                }
            }

            promiseRun();
        });
    }

    private invalidateBitcoinData(): Promise < void > {
        return new Promise < void >((resolve, reject) => {
            const promiseRun = async () => {
                if (this.fetchedCachedBitcoinDataEntityTimestamp + FIVE_MINUTES_IN_MILIS >= Date.now() && this.cachedBitcoinDataEntity !== null) {
                    resolve();
                    return;
                }

                const onResolve = (error) => {
                    if (error === null) {
                        resolve();
                    } else {
                        reject(error);
                    }
                };

                if (this.fetchingBitcoinDataCallbacks.length === 0) {
                    this.fetchingBitcoinDataCallbacks.push(onResolve);

                    let bitcoinDataEntity: BitcoinDataEntity;
                    let error;
                    try {
                        bitcoinDataEntity = await this.fetchBitcoinData();
                        error = null;
                    } catch (e) {
                        bitcoinDataEntity = null;
                        error = e;
                    }

                    if (bitcoinDataEntity !== null) {
                        this.cachedBitcoinDataEntity = bitcoinDataEntity;
                        this.fetchedCachedBitcoinDataEntityTimestamp = Date.now();
                    }

                    this.fetchingBitcoinDataCallbacks.forEach((callback) => {
                        callback(error);
                    });
                    this.fetchingBitcoinDataCallbacks = [];
                } else {
                    this.fetchingBitcoinDataCallbacks.push(onResolve);
                }
            }

            promiseRun();
        });
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

}
