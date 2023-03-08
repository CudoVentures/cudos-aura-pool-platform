import BigNumber from 'bignumber.js';
import S from '../../core/utilities/Main';

export default class MiningFarmPerformanceEntity {

    miningFarmId: string;
    volumePer24HoursInAcudos: BigNumber;
    volumePer24HoursInUsd: number;
    floorPriceInAcudos: BigNumber;

    constructor() {
        this.miningFarmId = S.Strings.NOT_EXISTS;
        this.volumePer24HoursInAcudos = new BigNumber(0);
        this.volumePer24HoursInUsd = 0;
        this.floorPriceInAcudos = null;
    }

    isFloorPriceSet(): boolean {
        return this.floorPriceInAcudos !== null;
    }

    static toJson(entity: MiningFarmPerformanceEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'miningFarmId': entity.miningFarmId,
            'volumePer24HoursInAcudos': entity.volumePer24HoursInAcudos.toString(10),
            'volumePer24HoursInUsd': entity.volumePer24HoursInUsd,
            'floorPriceInAcudos': entity.floorPriceInAcudos.toString(10),
        }
    }

    static fromJson(json: any): MiningFarmPerformanceEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmPerformanceEntity();

        entity.miningFarmId = (json.miningFarmId ?? entity.miningFarmId).toString();
        entity.volumePer24HoursInAcudos = new BigNumber(json.volumePer24HoursInAcudos ?? entity.volumePer24HoursInAcudos);
        entity.volumePer24HoursInUsd = Number(json.volumePer24HoursInUsd ?? entity.volumePer24HoursInUsd);
        entity.floorPriceInAcudos = json.floorPriceInAcudos ? new BigNumber(json.floorPriceInAcudos) : entity.floorPriceInAcudos;

        return entity;
    }
}
