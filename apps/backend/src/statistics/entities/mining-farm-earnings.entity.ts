import BigNumber from 'bignumber.js';

export default class MiningFarmEarningsEntity {

    totalMiningFarmSalesInAcudos: BigNumber;
    totalMiningFarmRoyaltiesInAcudos: BigNumber;
    totalNftSold: number;
    maintenanceFeeDepositedInBtc: BigNumber;
    earningsPerDayInAcudos: BigNumber[];

    constructor() {
        this.totalMiningFarmSalesInAcudos = new BigNumber(0);
        this.totalMiningFarmRoyaltiesInAcudos = new BigNumber(0);
        this.totalNftSold = 0;
        this.maintenanceFeeDepositedInBtc = new BigNumber(0);
        this.earningsPerDayInAcudos = [];
    }

    static toJson(entity: MiningFarmEarningsEntity) {

        if (entity === null) {
            return null;
        }

        return {
            'totalMiningFarmSalesInAcudos': entity.totalMiningFarmSalesInAcudos.toString(),
            'totalMiningFarmRoyaltiesInAcudos': entity.totalMiningFarmRoyaltiesInAcudos.toString(),
            'totalNftSold': entity.totalNftSold,
            'maintenanceFeeDepositedInBtc': entity.maintenanceFeeDepositedInBtc.toString(),
            'earningsPerDayInAcudos': entity.earningsPerDayInAcudos.map((j) => j.toString()),
        }
    }

    static fromJson(json: any): MiningFarmEarningsEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmEarningsEntity();

        entity.totalMiningFarmSalesInAcudos = new BigNumber(json.totalMiningFarmSalesInAcudos ?? entity.totalMiningFarmSalesInAcudos);
        entity.totalMiningFarmRoyaltiesInAcudos = new BigNumber(json.totalMiningFarmRoyaltiesInAcudos ?? entity.totalMiningFarmRoyaltiesInAcudos);
        entity.totalNftSold = parseInt(json.totalNftSold ?? entity.totalNftSold);
        entity.maintenanceFeeDepositedInBtc = new BigNumber(json.maintenanceFeeDepositedInBtc ?? entity.maintenanceFeeDepositedInBtc);
        entity.earningsPerDayInAcudos = (json.earningsPerDayInAcudos ?? entity.earningsPerDayInAcudos).map((j) => new BigNumber(j));

        return entity;
    }

}
