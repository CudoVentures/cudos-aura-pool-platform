import BigNumber from 'bignumber.js';

export default class CudosPriceDataEntity {

    cudosUsdPrice: number;
    cudosEthPrice: BigNumber;
    priceChangeInUsd: number;

    constructor() {
        this.cudosUsdPrice = null;
        this.cudosEthPrice = null;
        this.priceChangeInUsd = null;
    }

    static fromJson(json): CudosPriceDataEntity {

        if (!json) {
            return null;
        }

        const entity = new CudosPriceDataEntity();

        entity.cudosUsdPrice = Number(json.cudosUsdPrice || entity.cudosUsdPrice);
        entity.cudosEthPrice = new BigNumber(json.cudosEthPrice || entity.cudosEthPrice.toString());
        entity.priceChangeInUsd = Number(json.priceChangeInUsd || entity.priceChangeInUsd);

        return entity;
    }

}
