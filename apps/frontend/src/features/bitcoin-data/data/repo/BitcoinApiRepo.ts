import BitcoinDataEntity from '../../entities/BitcoinDataEntity';
import BitcoinRepo from '../../presentation/repos/BitcoinRepo';
import BitcoinApi from '../data-sources/BitcoinApi';

const LOCAL_STORAGE_KEY = 'cudos_aura_service_storage_bitcoin';

export default class BitcoinApiRepo implements BitcoinRepo {

    bitcoinApi: BitcoinApi;

    constructor() {
        this.bitcoinApi = new BitcoinApi();
    }

    async fetchBitcoinData(): Promise < BitcoinDataEntity > {
        let bitcoinDataEntity = new BitcoinDataEntity();
        const bitcoinDataEntityJsonString = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (bitcoinDataEntityJsonString !== null) {
            const bitcoinDataEntityJson = JSON.parse(bitcoinDataEntityJsonString);
            if (bitcoinDataEntity.modelVersion === BitcoinDataEntity.MODEL_VERSION) {
                bitcoinDataEntity = BitcoinDataEntity.fromJson(bitcoinDataEntityJson);
            }
        }

        if (bitcoinDataEntity.shouldUpdate() === false) {
            return bitcoinDataEntity;
        }

        bitcoinDataEntity = await this.bitcoinApi.fetchBitcoinData();
        bitcoinDataEntity.timestampLastUpdate = Date.now();

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(BitcoinDataEntity.toJson(bitcoinDataEntity)));
        return bitcoinDataEntity;
    }

}
