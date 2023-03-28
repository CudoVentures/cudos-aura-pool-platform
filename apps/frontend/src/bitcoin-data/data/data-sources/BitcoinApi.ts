import axios from '../../../core/utilities/AxiosWrapper';
import BigNumber from 'bignumber.js';
import BitcoinBlockchainInfoEntity from '../../entities/BitcoinBlockchainInfoEntity';
import BitcoinDataEntity from '../../entities/BitcoinDataEntity';
import { ResFetchBitcoinData } from '../dto/Responses';

export default class BitcoiApi {

    static URL = '/api/v1/crypto-compare';

    async fetchBitcoinData(): Promise < BitcoinDataEntity > {
        const { data } = await axios.post(`${BitcoiApi.URL}/fetchBitcoinData`);

        const res = new ResFetchBitcoinData(data);

        return res.bitcoinDataEntity;
        // const result = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin?tickers=false&community_data=false&developer_data=false&sparkline=false')
        // const resultJson = await result.json();

        // const bitcoinDataEntity = new BitcoinDataEntity();
        // bitcoinDataEntity.priceInUsd = resultJson.market_data.current_price.usd;
        // bitcoinDataEntity.priceChangeInUsd = resultJson.market_data.price_change_24h;
        // bitcoinDataEntity.timestampLastUpdate = Date.now();

        // return bitcoinDataEntity;
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
