import BigNumber from 'bignumber.js';
import S from '../../core/utilities/Main';
import { formatTHs } from '../../core/utilities/NumberFormatter';

export default class MiningFarmDetailsEntity {

    miningFarmId: string;
    averageHashPowerInTh: number;
    activeWorkers: number;
    nftsOwned: number;
    totalNftsSold: number;
    remainingHashPowerInTH: number;
    floorPriceInAcudos: BigNumber;

    constructor() {
        this.miningFarmId = S.Strings.NOT_EXISTS;
        this.averageHashPowerInTh = 0;
        this.activeWorkers = 0;
        this.nftsOwned = 0;
        this.totalNftsSold = 0;
        this.remainingHashPowerInTH = 0;
        this.floorPriceInAcudos = null;
    }

    hasFloorPrice(): boolean {
        return this.floorPriceInAcudos !== null;
    }

    formatHashPowerInTh(): string {
        return formatTHs(this.averageHashPowerInTh, true);
    }

    static toJson(entity: MiningFarmDetailsEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'miningFarmId': parseInt(entity.miningFarmId),
            'averageHashPowerInTh': entity.averageHashPowerInTh,
            'activeWorkers': entity.activeWorkers,
            'nftsOwned': entity.nftsOwned,
            'totalNftsSold': entity.totalNftsSold,
            'remainingHashPowerInTH': entity.remainingHashPowerInTH,
            'floorPriceInAcudos': entity.floorPriceInAcudos === null ? null : entity.floorPriceInAcudos.toString(10),
        }
    }

    static fromJson(json: any): MiningFarmDetailsEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmDetailsEntity();

        entity.miningFarmId = (json.miningFarmId ?? entity.miningFarmId).toString();
        entity.averageHashPowerInTh = parseInt(json.averageHashPowerInTh ?? entity.averageHashPowerInTh);
        entity.activeWorkers = parseInt(json.activeWorkers ?? entity.activeWorkers);
        entity.nftsOwned = parseInt(json.nftsOwned ?? entity.nftsOwned);
        entity.totalNftsSold = parseInt(json.totalNftsSold ?? entity.totalNftsSold);
        entity.remainingHashPowerInTH = parseInt(json.remainingHashPowerInTH ?? entity.remainingHashPowerInTH);
        entity.floorPriceInAcudos = json.floorPriceInAcudos === null ? null : new BigNumber(json.floorPriceInAcudos ?? entity.floorPriceInAcudos);

        return entity;
    }

}
