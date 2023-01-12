import StorageHelper from '../../../core/helpers/StorageHelper';
import BitcoinBlockchainInfoEntity from '../../entities/BitcoinBlockchainInfoEntity';
import BitcoinCoinGeckoEntity from '../../entities/BitcoinCoinGeckoEntity';
import BitcoinRepo from '../../presentation/repos/BitcoinRepo';

export default class BitcoinStorageRepo implements BitcoinRepo {

    storageHelper: StorageHelper;

    constructor(storageHelper) {
        this.storageHelper = storageHelper;
    }

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void) {}
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void) {}

    async fetchBitcoinCoinGecko(): Promise < BitcoinCoinGeckoEntity > {
        return BitcoinCoinGeckoEntity.fromJson(this.storageHelper.bitcoinDataJson);
    }

    async fetchBitcoinBlockchainInfo(): Promise < BitcoinBlockchainInfoEntity > {
        return new BitcoinBlockchainInfoEntity();
    }

}
