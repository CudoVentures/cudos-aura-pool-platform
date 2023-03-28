import BigNumber from 'bignumber.js';

export default class CudosDataEntity {

    cudosUsdPrice: number;
    cudosEthPrice: BigNumber;
    priceChangeInUsd: number;

    constructor(cudosUsdPrice: number, cudosEthPrice: BigNumber, priceChangeInUsd: number) {
        this.cudosUsdPrice = cudosUsdPrice;
        this.cudosEthPrice = cudosEthPrice;
        this.priceChangeInUsd = priceChangeInUsd;
    }

    static toJson(entity: CudosDataEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'cudosUsdPrice': entity.cudosUsdPrice,
            'cudosEthPrice': entity.cudosEthPrice.toString(),
            'priceChangeInUsd': entity.priceChangeInUsd,
        }
    }

}
