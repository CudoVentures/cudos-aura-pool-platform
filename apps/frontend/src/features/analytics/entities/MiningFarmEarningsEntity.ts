import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { makeAutoObservable } from 'mobx';
import ProjectUtils from '../../../core/utilities/ProjectUtils';

export default class MiningFarmEarningsEntity {

    totalMiningFarmSalesInAcudos: BigNumber;
    totalNftSold: number;
    maintenanceFeeDepositedInAcudos: BigNumber;
    earningsPerDayInUsd: number[];

    constructor() {
        this.totalMiningFarmSalesInAcudos = new BigNumber(0);
        this.totalNftSold = 0;
        this.maintenanceFeeDepositedInAcudos = new BigNumber(0);
        this.earningsPerDayInUsd = [];

        makeAutoObservable(this);
    }

    formatMaintenanceFeeDepositedInCudosInt(): string {
        const valueInCudos = this.maintenanceFeeDepositedInAcudos.dividedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER);
        const value = valueInCudos.toFixed(0)
        return numeral(value).format('0,0');
    }

    formatMaintenanceFeeDepositedInCudosFraction(): string {
        const valueInCudos = this.maintenanceFeeDepositedInAcudos.dividedBy(ProjectUtils.CUDOS_CURRENCY_DIVIDER);
        return valueInCudos.minus(valueInCudos).toFixed();
    }

    static toJson(entity: MiningFarmEarningsEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'totalMiningFarmSalesInAcudos': entity.totalMiningFarmSalesInAcudos.toString(),
            'totalNftSold': entity.totalNftSold,
            'maintenanceFeeDepositedInAcudos': entity.maintenanceFeeDepositedInAcudos.toString(),
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
        entity.maintenanceFeeDepositedInAcudos = new BigNumber(json.maintenanceFeeDepositedInAcudos ?? entity.maintenanceFeeDepositedInAcudos);
        entity.earningsPerDayInUsd = (json.earningsPerDayInUsd ?? entity.earningsPerDayInUsd).map((j) => parseInt(j));

        return entity;
    }

}
