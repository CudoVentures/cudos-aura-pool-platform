import BigNumber from 'bignumber.js';
import S from '../../core/utilities/Main';

export default class CudosDataEntity {

    static MODEL_VERSION = 2;

    modelVersion: number;
    priceInUsd: number;
    priceInEth: BigNumber;
    priceChangeInUsd: number;
    timestampLastUpdate: number;

    constructor() {
        this.modelVersion = CudosDataEntity.MODEL_VERSION
        this.priceInUsd = S.NOT_EXISTS;
        this.priceInEth = null;
        this.priceChangeInUsd = S.NOT_EXISTS;
        this.timestampLastUpdate = S.NOT_EXISTS;
    }

    shouldUpdate(): boolean {
        return this.timestampLastUpdate + 15 * 60 * 1000 < Date.now();
    }

    static toJson(entity: CudosDataEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'modelVersion': entity.modelVersion,
            'priceInUsd': entity.priceInUsd,
            'priceInEth': entity.priceInEth.toString(10),
            'priceChangeInUsd': entity.priceChangeInUsd,
            'timestampLastUpdate': entity.timestampLastUpdate,
        }
    }

    static fromJson(json): CudosDataEntity {
        if (json === null) {
            return null;
        }

        const model = new CudosDataEntity();

        model.modelVersion = parseInt(json.modelVersion) ?? model.modelVersion;
        model.priceInUsd = Number(json.priceInUsd) ?? model.priceInUsd;
        model.priceInEth = new BigNumber(json.priceInEth ?? model.priceInEth);
        model.priceChangeInUsd = Number(json.priceChangeInUsd) ?? model.priceChangeInUsd;
        model.timestampLastUpdate = parseInt(json.timestampLastUpdate ?? model.timestampLastUpdate);

        return model;
    }

}
