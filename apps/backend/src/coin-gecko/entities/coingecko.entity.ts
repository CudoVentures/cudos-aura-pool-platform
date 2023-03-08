import BigNumber from 'bignumber.js';

export default class CoingeckoEntity {

    cudosUsdPrice: number;
    cudosEthPrice: BigNumber;

    constructor(cudosUsdPrice: number, cudosEthPrice: BigNumber) {
        this.cudosUsdPrice = cudosUsdPrice;
        this.cudosEthPrice = cudosEthPrice;
    }

}
