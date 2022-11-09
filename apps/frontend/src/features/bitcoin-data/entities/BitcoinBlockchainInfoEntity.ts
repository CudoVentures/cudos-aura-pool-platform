import BigNumber from 'bignumber.js';
import S from '../../../core/utilities/Main';

export default class BitcoinBlockchainInfoEntity {

    static MODEL_VERSION = 1;

    modelVersion: number;
    blockReward: number;
    networkDifficulty: BigNumber;
    networkHashPowerInTh: number;
    timestampLastUpdate: number;

    constructor() {
        this.modelVersion = BitcoinBlockchainInfoEntity.MODEL_VERSION;
        this.blockReward = S.NOT_EXISTS;
        this.networkDifficulty = null;
        this.networkHashPowerInTh = S.NOT_EXISTS;
        this.timestampLastUpdate = S.NOT_EXISTS;
    }

    static getNetworkHashPowerInTh(networkDifficulty: BigNumber): number {
        const multiplier = new BigNumber(2).pow(32);
        const teraDivider = new BigNumber(1000000000000);

        return parseInt(networkDifficulty.multipliedBy(multiplier).dividedBy(600).dividedBy(teraDivider).toFixed(0));
    }

    setNetworkDifficulty(networkDifficulty: BigNumber) {
        this.networkDifficulty = networkDifficulty;
        this.networkHashPowerInTh = BitcoinBlockchainInfoEntity.getNetworkHashPowerInTh(networkDifficulty);
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
            'networkHashPowerInTh': entity.networkHashPowerInTh,
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
        model.networkHashPowerInTh = parseInt(json.networkHashPowerInTh ?? model.networkHashPowerInTh);
        model.timestampLastUpdate = parseInt(json.timestampLastUpdate ?? model.timestampLastUpdate);

        return model;
    }

}
