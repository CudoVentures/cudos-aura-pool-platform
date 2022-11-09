import BigNumber from 'bignumber.js';
import S from '../../../core/utilities/Main';

export default class BitcoinBlockchainInfoEntity {

    static MODEL_VERSION = 1;

    modelVersion: number;
    blockReward: number;
    networkDifficulty: BigNumber;
    networkHashRateInTh: number;
    timestampLastUpdate: number;

    constructor() {
        this.modelVersion = BitcoinBlockchainInfoEntity.MODEL_VERSION;
        this.blockReward = S.NOT_EXISTS;
        this.networkDifficulty = null;
        this.networkHashRateInTh = S.NOT_EXISTS;
        this.timestampLastUpdate = S.NOT_EXISTS;
    }

    setNetworkDifficulty(networkDifficulty: BigNumber) {
        const multiplier = new BigNumber(2).pow(32);
        const teraDivider = new BigNumber(1000000000000);

        this.networkDifficulty = networkDifficulty;
        this.networkHashRateInTh = parseInt(this.networkDifficulty.multipliedBy(multiplier).dividedBy(600).dividedBy(teraDivider).toFixed(0));
    }

    shouldUpdate(): boolean {
        return this.timestampLastUpdate + 48 * 3600 * 1000 < Date.now();
    }

    static toJson(entity: BitcoinBlockchainInfoEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'modelVersion': entity.modelVersion,
            'blockReward': entity.blockReward,
            'networkDifficulty': entity.networkDifficulty.toString(),
            'networkHashRateInTh': entity.networkHashRateInTh,
            'timestampLastUpdate': entity.timestampLastUpdate,
        }
    }

    static fromJson(json): BitcoinBlockchainInfoEntity {
        if (json === null) {
            return null;
        }

        const model = new BitcoinBlockchainInfoEntity();

        model.modelVersion = parseInt(json.modelVersion) ?? model.modelVersion;
        model.blockReward = parseFloat(json.blockReward ?? model.blockReward);
        model.networkDifficulty = new BigNumber(json.networkDifficulty ?? model.networkDifficulty);
        model.networkHashRateInTh = parseInt(json.networkHashRateInTh ?? model.networkHashRateInTh);
        model.timestampLastUpdate = parseInt(json.timestampLastUpdate ?? model.timestampLastUpdate);

        return model;
    }

}
