import axios from '../../../core/utilities/AxiosWrapper';
import BigNumber from 'bignumber.js';
import CudosDataEntity from '../../entities/CudosDataEntity';
import { ResFetchCudosData } from '../dto/Responses';

export default class CudosApi {

    static URL = '/api/v1/coin-gecko';

    async fetchCudosData(): Promise < CudosDataEntity > {
        const { data } = await axios.post(`${CudosApi.URL}/fetchCudosData`);

        const res = new ResFetchCudosData(data);

        return res.cudosDataEntity;

        // const result = await fetch('https://api.coingecko.com/api/v3/coins/cudos?tickers=false&community_data=false&developer_data=false&sparkline=false')
        // const resultJson = await result.json();

        // const cudosDataEntity = new CudosDataEntity();
        // cudosDataEntity.priceInUsd = resultJson.market_data.current_price.usd;
        // cudosDataEntity.priceInEth = new BigNumber(resultJson.market_data.current_price.eth);
        // cudosDataEntity.priceChangeInUsd = resultJson.market_data.price_change_24h;
        // cudosDataEntity.timestampLastUpdate = Date.now();

        // return cudosDataEntity;
    }

}
