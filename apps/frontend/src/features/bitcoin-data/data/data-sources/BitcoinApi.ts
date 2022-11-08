import BigNumber from 'bignumber.js';
import BitcoinBlockchainInfoEntity from '../../entities/BitcoinBlockchainInfoEntity';
import BitcoinCoinGeckoEntity from '../../entities/BitcoinCoinGeckoEntity';

export default class BitcoiApi {

    async fetchBitcoinCoinGecko(): Promise < BitcoinCoinGeckoEntity > {
        const result = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin?tickers=false&community_data=false&developer_data=false&sparkline=false')
        const resultJson = await result.json();

        const bitcoinCoinGeckoEntity = new BitcoinCoinGeckoEntity();
        bitcoinCoinGeckoEntity.priceInUsd = resultJson.market_data.current_price.usd;
        bitcoinCoinGeckoEntity.priceChangeInUsd = resultJson.market_data.price_change_24h;
        bitcoinCoinGeckoEntity.timestampLastUpdate = Date.now();

        return bitcoinCoinGeckoEntity;
    }

    async fetchBitcoinBlockchainInfo(): Promise < BitcoinBlockchainInfoEntity > {
        const resultDiff = await fetch('https://blockchain.info/q/getdifficulty');
        const resultTextDiff = await resultDiff.text();

        const resultReward = await fetch('https://blockchain.info/q/bcperblock');
        const resultTextReward = await resultReward.text();

        const bitcoinBlockchainInfoEntity = new BitcoinBlockchainInfoEntity();

        bitcoinBlockchainInfoEntity.blockReward = parseFloat(resultTextReward);
        bitcoinBlockchainInfoEntity.setNetworkDifficulty(new BigNumber(resultTextDiff));
        bitcoinBlockchainInfoEntity.timestampLastUpdate = Date.now();

        return bitcoinBlockchainInfoEntity;
    }

}
