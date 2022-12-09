import { NOT_EXISTS_INT } from '../../common/utils';
import { MiningFarmDetailsJsonValidator } from '../farm.types';

export default class MiningFarmDetailsEntity {

    miningFarmId: number;
    averageHashPowerInTh: number;
    activeWorkers: number;
    nftsOwned: number;
    totalNftsSold: number;
    remainingHashPowerInTH: number;

    constructor() {
        this.miningFarmId = NOT_EXISTS_INT;
        this.averageHashPowerInTh = 0;
        this.activeWorkers = 0;
        this.nftsOwned = 0;
        this.totalNftsSold = 0;
        this.remainingHashPowerInTH = 0;
    }

    static toJson(entity: MiningFarmDetailsEntity): MiningFarmDetailsJsonValidator {
        if (entity === null) {
            return null;
        }

        return {
            'miningFarmId': entity.miningFarmId.toString(),
            'averageHashPowerInTh': entity.averageHashPowerInTh,
            'activeWorkers': entity.activeWorkers,
            'nftsOwned': entity.nftsOwned,
            'totalNftsSold': entity.totalNftsSold,
            'remainingHashPowerInTH': entity.remainingHashPowerInTH,
        }
    }

    static fromJson(json: MiningFarmDetailsJsonValidator): MiningFarmDetailsEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmDetailsEntity();

        entity.miningFarmId = parseInt(json.miningFarmId ?? entity.miningFarmId.toString(0));
        entity.averageHashPowerInTh = json.averageHashPowerInTh ?? entity.averageHashPowerInTh;
        entity.activeWorkers = json.activeWorkers ?? entity.activeWorkers;
        entity.nftsOwned = json.nftsOwned ?? entity.nftsOwned;
        entity.totalNftsSold = json.totalNftsSold ?? entity.totalNftsSold;
        entity.remainingHashPowerInTH = json.remainingHashPowerInTH ?? entity.remainingHashPowerInTH;

        return entity;
    }

}
