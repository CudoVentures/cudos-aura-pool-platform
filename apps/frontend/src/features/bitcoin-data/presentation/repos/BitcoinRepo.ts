import BitcoinBlockchainInfoEntity from '../../entities/BitcoinBlockchainInfoEntity';
import BitcoinCoinGeckoEntity from '../../entities/BitcoinCoinGeckoEntity';

export default interface BitcoinRepo {

    setPresentationCallbacks(enableActions: () => void, disableActions: () => void);

    fetchBitcoinCoinGecko(): Promise < BitcoinCoinGeckoEntity >;
    fetchBitcoinBlockchainInfo(): Promise < BitcoinBlockchainInfoEntity >;

}
