import BigNumber from 'bignumber.js';
import S from '../../../core/utilities/Main';

export default class BitcoinDataEntity {

    static MODEL_VERSION = 1;

    modelVersion: number;
    priceInUsd: number;
    priceChangeInUsd: number;
    blockReward: number;
    networkDifficulty: BigNumber;
    timestampLastUpdate: number;

    constructor() {
        this.modelVersion = BitcoinDataEntity.MODEL_VERSION;
        this.priceInUsd = S.NOT_EXISTS;
        this.priceChangeInUsd = S.NOT_EXISTS;
        this.blockReward = S.NOT_EXISTS;
        this.networkDifficulty = null;
        this.timestampLastUpdate = S.NOT_EXISTS;
    }

    shouldUpdate(): boolean {
        return this.timestampLastUpdate + 2 * 3600 * 1000 < Date.now();
    }

    static toJson(entity: BitcoinDataEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'modelVersion': entity.modelVersion,
            'priceInUsd': entity.priceInUsd,
            'priceChangeInUsd': entity.priceChangeInUsd,
            'blockReward': entity.blockReward,
            'networkDifficulty': entity.networkDifficulty.toString(),
            'timestampLastUpdate': entity.networkDifficulty,
        }
    }

    static fromJson(json): BitcoinDataEntity {
        if (json === null) {
            return null;
        }

        const model = new BitcoinDataEntity();

        model.modelVersion = parseInt(json.modelVersion) ?? model.modelVersion;
        model.priceInUsd = Number(json.priceInUsd) ?? model.priceInUsd;
        model.priceChangeInUsd = Number(json.priceChangeInUsd) ?? model.priceChangeInUsd;
        model.blockReward = parseFloat(json.blockReward ?? model.blockReward);
        model.networkDifficulty = new BigNumber(json.networkDifficulty ?? model.networkDifficulty);
        model.timestampLastUpdate = parseInt(json.timestampLastUpdate ?? model.timestampLastUpdate);

        return model;
    }

}
