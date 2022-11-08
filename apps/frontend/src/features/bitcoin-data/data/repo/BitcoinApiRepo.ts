import BitcoinBlockchainInfoEntity from '../../entities/BitcoinBlockchainInfoEntity';
import BitcoinCoinGeckoEntity from '../../entities/BitcoinCoinGeckoEntity';
import BitcoinRepo from '../../presentation/repos/BitcoinRepo';
import BitcoinApi from '../data-sources/BitcoinApi';

const LOCAL_STORAGE_COIN_GECKO_KEY = 'cudos_aura_service_storage_bitcoin_coingecko';
const LOCAL_STORAGE_BLOCKCHAIN_INFO_KEY = 'cudos_aura_service_storage_bitcoin_blockchaininfo';

export default class BitcoinApiRepo implements BitcoinRepo {

    bitcoinApi: BitcoinApi;
    enableActions: () => void;
    disableActions: () => void;

    constructor() {
        this.bitcoinApi = new BitcoinApi();
        this.enableActions = null;
        this.disableActions = null;
    }

    setPresentationCallbacks(enableActions: () => void, disableActions: () => void) {
        this.enableActions = enableActions;
        this.disableActions = disableActions;
    }

    async fetchBitcoinCoinGecko(): Promise < BitcoinCoinGeckoEntity > {
        let bitcoinCoinGeckoEntity = new BitcoinCoinGeckoEntity();
        const bitcoinCoinGeckoEntityJsonString = localStorage.getItem(LOCAL_STORAGE_COIN_GECKO_KEY);
        if (bitcoinCoinGeckoEntityJsonString !== null) {
            const bitcoinCoinGeckoEntityJson = JSON.parse(bitcoinCoinGeckoEntityJsonString);
            if (bitcoinCoinGeckoEntity.modelVersion === BitcoinCoinGeckoEntity.MODEL_VERSION) {
                bitcoinCoinGeckoEntity = BitcoinCoinGeckoEntity.fromJson(bitcoinCoinGeckoEntityJson);
            }
        }

        if (bitcoinCoinGeckoEntity.shouldUpdate() === false) {
            return bitcoinCoinGeckoEntity;
        }

        try {
            this.disableActions?.();
            bitcoinCoinGeckoEntity = await this.bitcoinApi.fetchBitcoinCoinGecko();
            bitcoinCoinGeckoEntity.timestampLastUpdate = Date.now();

            localStorage.setItem(LOCAL_STORAGE_COIN_GECKO_KEY, JSON.stringify(BitcoinCoinGeckoEntity.toJson(bitcoinCoinGeckoEntity)));
        } finally {
            this.enableActions?.();
        }

        return bitcoinCoinGeckoEntity;
    }

    async fetchBitcoinBlockchainInfo(): Promise < BitcoinBlockchainInfoEntity > {
        let bitcoinBlockchainInfoEntity = new BitcoinBlockchainInfoEntity();
        const bitcoinBlockchainInfoEntityJsonString = localStorage.getItem(LOCAL_STORAGE_BLOCKCHAIN_INFO_KEY);
        if (bitcoinBlockchainInfoEntityJsonString !== null) {
            const bitcoinBlockchainInfoEntityJson = JSON.parse(bitcoinBlockchainInfoEntityJsonString);
            if (bitcoinBlockchainInfoEntity.modelVersion === BitcoinBlockchainInfoEntity.MODEL_VERSION) {
                bitcoinBlockchainInfoEntity = BitcoinBlockchainInfoEntity.fromJson(bitcoinBlockchainInfoEntityJson);
            }
        }

        if (bitcoinBlockchainInfoEntity.shouldUpdate() === false) {
            return bitcoinBlockchainInfoEntity;
        }

        try {
            this.disableActions?.();

            bitcoinBlockchainInfoEntity = await this.bitcoinApi.fetchBitcoinBlockchainInfo();
            bitcoinBlockchainInfoEntity.timestampLastUpdate = Date.now();

            localStorage.setItem(LOCAL_STORAGE_BLOCKCHAIN_INFO_KEY, JSON.stringify(BitcoinBlockchainInfoEntity.toJson(bitcoinBlockchainInfoEntity)));
        } finally {
            this.enableActions?.();
        }

        return bitcoinBlockchainInfoEntity;
    }

}
