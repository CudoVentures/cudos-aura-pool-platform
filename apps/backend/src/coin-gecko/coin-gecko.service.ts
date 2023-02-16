import { Injectable } from '@nestjs/common';
import axios from 'axios';
import BigNumber from 'bignumber.js';

@Injectable()
export default class CoinGeckoService {
    static coinGeckoCudosApiUrl = 'https://api.coingecko.com/api/v3/coins/cudos?tickers=false&community_data=false&developer_data=false&sparkline=false'

    async fetchCudosPrice(): Promise < {usdPrice: number, ethPrice: BigNumber } > {
        const resultJson = await axios.get(CoinGeckoService.coinGeckoCudosApiUrl);

        return {
            usdPrice: Number(resultJson.data.market_data.current_price.usd),
            ethPrice: new BigNumber(resultJson.data.market_data.current_price.eth),
        }
    }
}
