import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export default class CoinGeckoService {
    static coinGeckoCudosApiUrl = 'https://api.coingecko.com/api/v3/coins/cudos?tickers=false&community_data=false&developer_data=false&sparkline=false'

    async fetchCudosPrice(): Promise < number > {
        const resultJson = await axios.get(CoinGeckoService.coinGeckoCudosApiUrl);

        return Number(resultJson.data.market_data.current_price.usd);
    }
}
