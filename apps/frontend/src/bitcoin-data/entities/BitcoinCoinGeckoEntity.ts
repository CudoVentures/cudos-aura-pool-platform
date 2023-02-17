import BigNumber from 'bignumber.js';
import S from '../../core/utilities/Main';

export default class BitcoinCoinGeckoEntity {

    static MODEL_VERSION = 1;

    modelVersion: number;
    priceInUsd: number;
    priceChangeInUsd: number;
    timestampLastUpdate: number;

    constructor() {
        this.modelVersion = BitcoinCoinGeckoEntity.MODEL_VERSION;
        this.priceInUsd = S.NOT_EXISTS;
        this.priceChangeInUsd = S.NOT_EXISTS;
        this.timestampLastUpdate = S.NOT_EXISTS;
    }

    shouldUpdate(): boolean {
        return this.timestampLastUpdate + 15 * 60 * 1000 < Date.now();
    }

    static toJson(entity: BitcoinCoinGeckoEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'modelVersion': entity.modelVersion,
            'priceInUsd': entity.priceInUsd,
            'priceChangeInUsd': entity.priceChangeInUsd,
            'timestampLastUpdate': entity.timestampLastUpdate,
        }
    }

    static fromJson(json): BitcoinCoinGeckoEntity {
        if (json === null) {
            return null;
        }

        const model = new BitcoinCoinGeckoEntity();

        model.modelVersion = parseInt(json.modelVersion) ?? model.modelVersion;
        model.priceInUsd = Number(json.priceInUsd) ?? model.priceInUsd;
        model.priceChangeInUsd = Number(json.priceChangeInUsd) ?? model.priceChangeInUsd;
        model.timestampLastUpdate = parseInt(json.timestampLastUpdate ?? model.timestampLastUpdate);

        return model;
    }

}
