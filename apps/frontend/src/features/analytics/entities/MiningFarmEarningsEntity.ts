import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { makeAutoObservable } from 'mobx';

export default class MiningFarmEarningsEntity {

    totalMiningFarmSalesInAcudos: BigNumber;
    totalNftSold: number;
    maintenanceFeeDepositedInBtc: BigNumber;
    earningsPerDayInUsd: number[];

    constructor() {
        this.totalMiningFarmSalesInAcudos = new BigNumber(0);
        this.totalNftSold = 0;
        this.maintenanceFeeDepositedInBtc = new BigNumber(0);
        this.earningsPerDayInUsd = [];

        makeAutoObservable(this);
    }

    formatMaintenanceFeeDepositedInBtcInt(): string {
        const value = this.maintenanceFeeDepositedInBtc.toFixed(0)
        return numeral(value).format('0,0');
    }

    formatMaintenanceFeeDepositedInBtcFraction(): string {
        return this.maintenanceFeeDepositedInBtc.minus(this.maintenanceFeeDepositedInBtc.integerValue()).shiftedBy(4).toFixed(0);
    }

    static toJson(entity: MiningFarmEarningsEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'totalMiningFarmSalesInAcudos': entity.totalMiningFarmSalesInAcudos.toString(),
            'totalNftSold': entity.totalNftSold,
            'maintenanceFeeDepositedInBtc': entity.maintenanceFeeDepositedInBtc.toString(),
            'earningsPerDayInUsd': entity.earningsPerDayInUsd,
        }
    }

    static fromJson(json: any): MiningFarmEarningsEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmEarningsEntity();

        entity.totalMiningFarmSalesInAcudos = new BigNumber(json.totalMiningFarmSalesInAcudos ?? entity.totalMiningFarmSalesInAcudos);
        entity.totalNftSold = parseInt(json.totalNftSold ?? entity.totalNftSold);
        entity.maintenanceFeeDepositedInBtc = new BigNumber(json.maintenanceFeeDepositedInBtc ?? entity.maintenanceFeeDepositedInBtc);
        entity.earningsPerDayInUsd = (json.earningsPerDayInUsd ?? entity.earningsPerDayInUsd).map((j) => parseInt(j));

        return entity;
    }

}
