import BigNumber from 'bignumber.js';
import S from '../../../core/utilities/Main';

export default class MiningFarmPerformanceEntity {

    miningFarmId: string;
    volumePer24HoursInAcudos: BigNumber;
    volumePer24HoursInUsd: BigNumber;
    floorPriceInAcudos: BigNumber;

    constructor() {
        this.miningFarmId = S.Strings.NOT_EXISTS;
        this.volumePer24HoursInAcudos = new BigNumber(0);
        this.volumePer24HoursInUsd = new BigNumber(0);
        this.floorPriceInAcudos = new BigNumber(0);
    }

    static toJson(entity: MiningFarmPerformanceEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'miningFarmId': entity.miningFarmId,
            'volumePer24HoursInAcudos': entity.volumePer24HoursInAcudos.toString(),
            'volumePer24HoursInUsd': entity.volumePer24HoursInUsd.toString(),
            'floorPriceInAcudos': entity.floorPriceInAcudos.toString(),
        }
    }

    static fromJson(json: any): MiningFarmPerformanceEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmPerformanceEntity();

        entity.miningFarmId = (json.miningFarmId ?? entity.miningFarmId).toString();
        entity.volumePer24HoursInAcudos = new BigNumber(json.volumePer24HoursInAcudos ?? entity.volumePer24HoursInAcudos);
        entity.volumePer24HoursInUsd = new BigNumber(json.volumePer24HoursInUsd ?? entity.volumePer24HoursInUsd);
        entity.floorPriceInAcudos = new BigNumber(json.floorPriceInAcudos ?? entity.floorPriceInAcudos);

        return entity;
    }
}