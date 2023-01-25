import BigNumber from 'bignumber.js';
import { NOT_EXISTS_INT } from '../../common/utils';
import { MiningFarmDetailsJsonValidator } from '../farm.types';

export default class MiningFarmDetailsEntity {

    miningFarmId: number;
    averageHashPowerInTh: number;
    activeWorkers: number;
    nftsOwned: number;
    totalNftsSold: number;
    remainingHashPowerInTH: number;
    floorPriceInAcudos: BigNumber;

    constructor() {
        this.miningFarmId = NOT_EXISTS_INT;
        this.averageHashPowerInTh = 0;
        this.activeWorkers = 0;
        this.nftsOwned = 0;
        this.totalNftsSold = 0;
        this.remainingHashPowerInTH = 0;
        this.floorPriceInAcudos = null;
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
            'floorPriceInAcudos': entity.floorPriceInAcudos === null ? null : entity.floorPriceInAcudos.toString(10),
        }
    }

    static fromJson(json: MiningFarmDetailsJsonValidator): MiningFarmDetailsEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmDetailsEntity();

        entity.miningFarmId = parseInt(json.miningFarmId ?? entity.miningFarmId.toString());
        entity.averageHashPowerInTh = json.averageHashPowerInTh ?? entity.averageHashPowerInTh;
        entity.activeWorkers = json.activeWorkers ?? entity.activeWorkers;
        entity.nftsOwned = json.nftsOwned ?? entity.nftsOwned;
        entity.totalNftsSold = json.totalNftsSold ?? entity.totalNftsSold;
        entity.remainingHashPowerInTH = json.remainingHashPowerInTH ?? entity.remainingHashPowerInTH;
        entity.floorPriceInAcudos = json.floorPriceInAcudos === null ? null : new BigNumber(json.floorPriceInAcudos ?? entity.floorPriceInAcudos);

        return entity;
    }

}
