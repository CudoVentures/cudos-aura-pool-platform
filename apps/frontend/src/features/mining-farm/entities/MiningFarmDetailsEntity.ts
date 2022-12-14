import S from '../../../core/utilities/Main';

export default class MiningFarmDetailsEntity {

    miningFarmId: string;
    averageHashPowerInTh: number;
    activeWorkers: number;
    nftsOwned: number;
    totalNftsSold: number;
    remainingHashPowerInTH: number;

    constructor() {
        this.miningFarmId = S.Strings.NOT_EXISTS;
        this.averageHashPowerInTh = 0;
        this.activeWorkers = 0;
        this.nftsOwned = 0;
        this.totalNftsSold = 0;
        this.remainingHashPowerInTH = 0;
    }

    formatHashPowerInTh(): string {
        return `${this.averageHashPowerInTh} TH`;
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
        }
    }

    static fromJson(json: any): MiningFarmDetailsEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmDetailsEntity();

        entity.miningFarmId = (json.id ?? entity.miningFarmId).toString();
        entity.averageHashPowerInTh = parseInt(json.averageHashRateH1 ?? entity.averageHashPowerInTh);
        entity.activeWorkers = parseInt(json.activeWorkersCount ?? entity.activeWorkers);
        entity.nftsOwned = parseInt(json.nftsOwned ?? entity.nftsOwned);
        entity.totalNftsSold = parseInt(json.nftsSold ?? entity.totalNftsSold);
        entity.remainingHashPowerInTH = parseInt(json.remainingHashPowerInTH ?? entity.remainingHashPowerInTH);

        return entity;
    }

}
