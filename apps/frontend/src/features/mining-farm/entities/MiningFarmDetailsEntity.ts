import S from '../../../core/utilities/Main';

export default class MiningFarmDetailsEntity {

    miningFarmId: string;
    averageHashRateInTh: number;
    activeWorkers: number;
    nftsOwned: number;
    totalNftsSold: number;

    constructor() {
        this.miningFarmId = S.Strings.NOT_EXISTS;
        this.averageHashRateInTh = 0;
        this.activeWorkers = 0;
        this.nftsOwned = 0;
        this.totalNftsSold = 0;
    }

    formatHashRateInTh(): string {
        return `${this.averageHashRateInTh} TH`;
    }

    static toJson(entity: MiningFarmDetailsEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'miningFarmId': entity.miningFarmId,
            'averageHashRateInTh': entity.averageHashRateInTh,
            'activeWorkers': entity.activeWorkers,
            'nftsOwned': entity.nftsOwned,
            'totalNftsSold': entity.totalNftsSold,
        }
    }

    static fromJson(json: any): MiningFarmDetailsEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmDetailsEntity();

        entity.miningFarmId = (json.miningFarmId ?? entity.miningFarmId).toString();
        entity.averageHashRateInTh = parseInt(json.averageHashRateInTh ?? entity.averageHashRateInTh);
        entity.activeWorkers = parseInt(json.activeWorkers ?? entity.activeWorkers);
        entity.nftsOwned = parseInt(json.nftsOwned ?? entity.nftsOwned);
        entity.totalNftsSold = parseInt(json.totalNftsSold ?? entity.totalNftsSold);

        return entity;
    }

}
