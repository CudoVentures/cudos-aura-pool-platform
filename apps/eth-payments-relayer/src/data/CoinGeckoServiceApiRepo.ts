import axios from 'axios';
import BigNumber from 'bignumber.js';
import CoinGeckoServiceRepo from '../workers/repos/CoinGeckoServiceRepo';

export default class CoinGeckoServiceApiRepo implements CoinGeckoServiceRepo {
    static coinGeckoBaseUrl = 'https://api.coingecko.com/api/v3/coins/';
    static coinGeckoEthApiUrl = `${CoinGeckoServiceApiRepo.coinGeckoBaseUrl}eth?tickers=false&community_data=false&developer_data=false&sparkline=false`
    static coinGeckoCudosApiUrl = `${CoinGeckoServiceApiRepo.coinGeckoBaseUrl}cudos?tickers=false&community_data=false&developer_data=false&sparkline=false`

    async fetchEthUsdPrice(): Promise<number> {
        const resultJson = await axios.get(CoinGeckoServiceApiRepo.coinGeckoEthApiUrl);

        return Number(resultJson.data.market_data.current_price.usd)
    }

    async fetchCudosEthPrice(): Promise<BigNumber> {
        const resultJson = await axios.get(CoinGeckoServiceApiRepo.coinGeckoCudosApiUrl);

        return new BigNumber(resultJson.data.market_data.current_price.eth)
    }

}
