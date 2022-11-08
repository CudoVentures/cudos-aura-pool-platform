import BitcoinBlockchainInfoEntity from '../../entities/BitcoinBlockchainInfoEntity';
import BitcoinCoinGeckoEntity from '../../entities/BitcoinCoinGeckoEntity';

export default interface BitcoinRepo {

    fetchBitcoinCoinGecko(): Promise < BitcoinCoinGeckoEntity >;
    fetchBitcoinBlockchainInfo(): Promise < BitcoinBlockchainInfoEntity >;

}
