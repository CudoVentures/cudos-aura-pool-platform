import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { makeAutoObservable } from 'mobx';

export default class MiningFarmEarningsEntity {

    totalFarmSalesInUsd: number;
    totalNftSold: number;
    maintenanceFeeDepositedInCudos: BigNumber;
    maintenanceFeeDepositedInUsd: number;
    earningsPerDayInUsd: number[];

    constructor() {
        this.totalFarmSalesInUsd = 0;
        this.totalNftSold = 0;
        this.maintenanceFeeDepositedInCudos = new BigNumber(0);
        this.maintenanceFeeDepositedInUsd = 0;
        this.earningsPerDayInUsd = [];

        makeAutoObservable(this);
    }

    formatTotalFarmSalesInUsd(): string {
        return `${numeral(this.totalFarmSalesInUsd / 1000).format('$0,0.0')}k`;
    }

    formatMaintenanceFeeDepositedInCudosInt(): string {
        const value = this.maintenanceFeeDepositedInCudos.toFixed(0)
        return numeral(value).format('0,0');
    }

    formatMaintenanceFeeDepositedInCudosFraction(): string {
        return this.maintenanceFeeDepositedInCudos.minus(this.maintenanceFeeDepositedInCudos.integerValue()).toFixed();
    }

    formatMaintenanceFeeDepositedInUsd(): string {
        return numeral(this.maintenanceFeeDepositedInUsd).format('$0,0');
    }

    static toJson(entity: MiningFarmEarningsEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'totalFarmSalesInUsd': entity.totalFarmSalesInUsd,
            'totalNftSold': entity.totalNftSold,
            'maintenanceFeeDepositedInCudos': entity.maintenanceFeeDepositedInCudos.toString(),
            'maintenanceFeeDepositedInUsd': entity.maintenanceFeeDepositedInUsd,
            'earningsPerDayInUsd': entity.earningsPerDayInUsd,
        }
    }

    static fromJson(json: any): MiningFarmEarningsEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmEarningsEntity();

        entity.totalFarmSalesInUsd = parseInt(json.totalFarmSalesInUsd ?? entity.totalFarmSalesInUsd);
        entity.totalNftSold = parseInt(json.totalNftSold ?? entity.totalNftSold);
        entity.maintenanceFeeDepositedInCudos = new BigNumber(json.maintenanceFeeDepositedInCudos ?? entity.maintenanceFeeDepositedInCudos);
        entity.maintenanceFeeDepositedInUsd = parseInt(json.maintenanceFeeDepositedInUsd ?? entity.maintenanceFeeDepositedInUsd);
        entity.earningsPerDayInUsd = (json.earningsPerDayInUsd ?? entity.earningsPerDayInUsd).map((j) => parseInt(j));

        return entity;
    }

}
