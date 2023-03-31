import BigNumber from 'bignumber.js';

export default interface CryptoCompareRepo {

    fetchEthUsdPrice(): Promise < number >;
    fetchCudosEthPrice(): Promise < BigNumber >;
}
