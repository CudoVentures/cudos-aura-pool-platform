import BitcoinBlockchainInfoEntity from '../../entities/BitcoinBlockchainInfoEntity';
import BitcoinCoinGeckoEntity from '../../entities/BitcoinCoinGeckoEntity';

export default interface BitcoinRepo {

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);

    fetchBitcoinCoinGecko(): Promise < BitcoinCoinGeckoEntity >;
    fetchBitcoinBlockchainInfo(): Promise < BitcoinBlockchainInfoEntity >;

}
