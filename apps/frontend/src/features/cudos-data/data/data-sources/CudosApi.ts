import CudosDataEntity from '../../entities/CudosDataEntity';

export default class CudosApi {

    async fetchCudosData(): Promise < CudosDataEntity > {
        const result = await fetch('https://api.coingecko.com/api/v3/coins/cudos?tickers=false&community_data=false&developer_data=false&sparkline=false')
        const resultJson = await result.json();

        const bitcoinDataEntity = new CudosDataEntity();
        bitcoinDataEntity.priceInUsd = resultJson.market_data.current_price.usd;
        bitcoinDataEntity.priceChangeInUsd = resultJson.market_data.price_change_24h;
        bitcoinDataEntity.timestampLastUpdate = Date.now();

        return bitcoinDataEntity;
    }

}
