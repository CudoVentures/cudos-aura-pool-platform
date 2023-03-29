import axios from 'axios';
import BigNumber from 'bignumber.js';
import CryptoCompareRepo from '../workers/repos/CryptoCompareRepo';

export default class CryptoCompareApiRepo implements CryptoCompareRepo {
    static cryptoCompareBaseUrl = 'https://min-api.cryptocompare.com/data/pricemultifull';
    static cryptoCompareEthApiUrl = `${CryptoCompareApiRepo.cryptoCompareBaseUrl}?fsyms=ETH&tsyms=USD`
    static cryptoCompareCudosApiUrl = `${CryptoCompareApiRepo.cryptoCompareBaseUrl}?fsyms=CUDOS&tsyms=USD,ETH`

    async fetchEthUsdPrice(): Promise<number> {
        const resultJson = await axios.get(CryptoCompareApiRepo.cryptoCompareEthApiUrl);
        return Number(resultJson.data.RAW.ETH.USD.PRICE)
    }

    async fetchCudosEthPrice(): Promise<BigNumber> {
        const resultJson = await axios.get(CryptoCompareApiRepo.cryptoCompareCudosApiUrl);
        return new BigNumber(resultJson.data.RAW.CUDOS.ETH.PRICE)
    }

}
