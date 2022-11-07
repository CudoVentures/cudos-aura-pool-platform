import BigNumber from 'bignumber.js';
import BitcoinDataEntity from '../../entities/BitcoinDataEntity';

export default class BitcoiApi {

    async fetchBitcoinData(): Promise < BitcoinDataEntity > {
        const result = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin?tickers=false&community_data=false&developer_data=false&sparkline=false')
        const resultJson = await result.json();

        const bitcoinDataEntity = new BitcoinDataEntity();
        bitcoinDataEntity.priceInUsd = resultJson.market_data.current_price.usd;
        bitcoinDataEntity.priceChangeInUsd = resultJson.market_data.price_change_24h;
        bitcoinDataEntity.blockReward = 6.25;
        bitcoinDataEntity.networkDifficulty = new BigNumber(36840000000000);
        bitcoinDataEntity.timestampLastUpdate = Date.now();

        return bitcoinDataEntity;
    }

}
