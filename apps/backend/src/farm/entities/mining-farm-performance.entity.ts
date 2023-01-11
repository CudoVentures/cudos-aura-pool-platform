import BigNumber from 'bignumber.js';
import { NOT_EXISTS_INT } from '../../common/utils';
import { MiningFarmPerformanceJsonValidator } from '../farm.types';

export default class MiningFarmPerformanceEntity {

    miningFarmId: number;
    volumePer24HoursInAcudos: BigNumber;
    volumePer24HoursInUsd: number;
    floorPriceInAcudos: BigNumber;

    constructor() {
        this.miningFarmId = NOT_EXISTS_INT;
        this.volumePer24HoursInAcudos = new BigNumber(0);
        this.volumePer24HoursInUsd = 0;
        this.floorPriceInAcudos = null;
    }

    isFloorPriceSet(): boolean {
        return this.floorPriceInAcudos !== null;
    }

    static newInstanceForMiningFarm(miningFarmId: number) {
        const entity = new MiningFarmPerformanceEntity();

        entity.miningFarmId = miningFarmId;

        return entity;
    }

    static toJson(entity: MiningFarmPerformanceEntity): MiningFarmPerformanceJsonValidator {
        if (entity === null) {
            return null;
        }

        return {
            'miningFarmId': entity.miningFarmId.toString(),
            'volumePer24HoursInAcudos': entity.volumePer24HoursInAcudos.toString(),
            'volumePer24HoursInUsd': entity.volumePer24HoursInUsd,
            'floorPriceInAcudos': entity.floorPriceInAcudos.toString(),
        }
    }

    static fromJson(json: MiningFarmPerformanceJsonValidator): MiningFarmPerformanceEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmPerformanceEntity();

        entity.miningFarmId = parseInt(json.miningFarmId ?? entity.miningFarmId.toString());
        entity.volumePer24HoursInAcudos = new BigNumber(json.volumePer24HoursInAcudos ?? entity.volumePer24HoursInAcudos);
        entity.volumePer24HoursInUsd = Number(json.volumePer24HoursInUsd ?? entity.volumePer24HoursInUsd);
        entity.floorPriceInAcudos = new BigNumber(json.floorPriceInAcudos ?? entity.floorPriceInAcudos);

        return entity;
    }
}
