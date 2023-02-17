import BigNumber from 'bignumber.js';

export default interface CoinGeckoServiceRepo {

    fetchEthUsdPrice(): Promise < number >;
    fetchCudosEthPrice(): Promise < BigNumber >;
}
