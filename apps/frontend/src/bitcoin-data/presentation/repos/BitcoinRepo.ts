import BitcoinBlockchainInfoEntity from '../../entities/BitcoinBlockchainInfoEntity';
import BitcoinDataEntity from '../../entities/BitcoinDataEntity';

export default interface BitcoinRepo {

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);

    fetchBitcoinCoinGecko(): Promise < BitcoinDataEntity >;
    fetchBitcoinBlockchainInfo(): Promise < BitcoinBlockchainInfoEntity >;

}
