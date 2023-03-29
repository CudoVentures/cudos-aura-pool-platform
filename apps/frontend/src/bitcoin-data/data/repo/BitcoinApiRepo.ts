import BitcoinBlockchainInfoEntity from '../../entities/BitcoinBlockchainInfoEntity';
import BitcoinDataEntity from '../../entities/BitcoinDataEntity';
import BitcoinRepo from '../../presentation/repos/BitcoinRepo';
import BitcoinApi from '../data-sources/BitcoinApi';

const LOCAL_STORAGE_COIN_GECKO_KEY = 'cudos_aura_service_storage_bitcoin_coingecko';
const LOCAL_STORAGE_BLOCKCHAIN_INFO_KEY = 'cudos_aura_service_storage_bitcoin_blockchaininfo';

export default class BitcoinApiRepo implements BitcoinRepo {

    bitcoinApi: BitcoinApi;
    enableActions: () => void;
    disableActions: () => void;
    showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void;

    constructor() {
        this.bitcoinApi = new BitcoinApi();
        this.enableActions = null;
        this.disableActions = null;
        this.showAlert = null;
    }

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void) {
        this.enableActions = enableActions;
        this.disableActions = disableActions;
    }

    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener: null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void) {
        this.showAlert = showAlert;
    }

    async fetchBitcoinData(): Promise < BitcoinDataEntity > {
        let bitcoinDataEntity = new BitcoinDataEntity();
        const bitcoinDataEntityJsonString = localStorage.getItem(LOCAL_STORAGE_COIN_GECKO_KEY);
        if (bitcoinDataEntityJsonString !== null) {
            const bitcoinDataEntityJson = JSON.parse(bitcoinDataEntityJsonString);
            if (bitcoinDataEntityJson.modelVersion === BitcoinDataEntity.MODEL_VERSION) {
                bitcoinDataEntity = BitcoinDataEntity.fromJson(bitcoinDataEntityJson);
            }
        }

        if (bitcoinDataEntity.shouldUpdate() === false) {
            return bitcoinDataEntity;
        }

        try {
            this.disableActions?.();
            bitcoinDataEntity = await this.bitcoinApi.fetchBitcoinData();
            bitcoinDataEntity.timestampLastUpdate = Date.now();

            localStorage.setItem(LOCAL_STORAGE_COIN_GECKO_KEY, JSON.stringify(BitcoinDataEntity.toJson(bitcoinDataEntity)));
        } finally {
            this.enableActions?.();
        }

        return bitcoinDataEntity;
    }

    async fetchBitcoinBlockchainInfo(): Promise < BitcoinBlockchainInfoEntity > {
        let bitcoinBlockchainInfoEntity = new BitcoinBlockchainInfoEntity();
        const bitcoinBlockchainInfoEntityJsonString = localStorage.getItem(LOCAL_STORAGE_BLOCKCHAIN_INFO_KEY);
        if (bitcoinBlockchainInfoEntityJsonString !== null) {
            const bitcoinBlockchainInfoEntityJson = JSON.parse(bitcoinBlockchainInfoEntityJsonString);
            if (bitcoinBlockchainInfoEntityJson.modelVersion === BitcoinBlockchainInfoEntity.MODEL_VERSION) {
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
