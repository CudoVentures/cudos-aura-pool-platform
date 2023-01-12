import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { makeAutoObservable } from 'mobx';
import { CURRENCY_DECIMALS } from 'cudosjs';

export default class MiningFarmEarningsEntity {

    totalMiningFarmNftSalesInAcudos: BigNumber;
    totalMiningFarmRoyaltiesInAcudos: BigNumber;
    totalNftSold: number;
    maintenanceFeeDepositedInBtc: BigNumber;
    earningsPerDayInAcudos: BigNumber[];

    constructor() {
        this.totalMiningFarmNftSalesInAcudos = new BigNumber(0);
        this.totalMiningFarmRoyaltiesInAcudos = new BigNumber(0);
        this.totalNftSold = 0;
        this.maintenanceFeeDepositedInBtc = new BigNumber(0);
        this.earningsPerDayInAcudos = [];

        makeAutoObservable(this);
    }

    getTotalMiningFarmSales(): BigNumber {
        return this.totalMiningFarmNftSalesInAcudos.plus(this.totalMiningFarmRoyaltiesInAcudos);
    }

    formatMaintenanceFeeDepositedInBtcInt(): string {
        const value = this.maintenanceFeeDepositedInBtc.toFixed(0)
        return numeral(value).format('0,0');
    }

    formatMaintenanceFeeDepositedInBtcFraction(): string {
        return this.maintenanceFeeDepositedInBtc.minus(this.maintenanceFeeDepositedInBtc.integerValue()).shiftedBy(4).toFixed(0);
    }

    formatEarningsPerDayToCudosNumbers(): number[] {
        return this.earningsPerDayInAcudos.map((e) => parseFloat(e.shiftedBy(-CURRENCY_DECIMALS).toFixed(4)));
    }

    static toJson(entity: MiningFarmEarningsEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'totalMiningFarmNftSalesInAcudos': entity.totalMiningFarmNftSalesInAcudos.toFixed(0),
            'totalMiningFarmRoyaltiesInAcudos': entity.totalMiningFarmNftSalesInAcudos.toFixed(0),
            'totalNftSold': entity.totalNftSold,
            'maintenanceFeeDepositedInBtc': entity.maintenanceFeeDepositedInBtc.toFixed(0),
            'earningsPerDayInAcudos': entity.earningsPerDayInAcudos.map((j) => j.toFixed(0)),
        }
    }

    static fromJson(json: any): MiningFarmEarningsEntity {
        if (json === null) {
            return null;
        }

        const entity = new MiningFarmEarningsEntity();

        entity.totalMiningFarmNftSalesInAcudos = new BigNumber(json.totalMiningFarmNftSalesInAcudos ?? entity.totalMiningFarmNftSalesInAcudos);
        entity.totalMiningFarmRoyaltiesInAcudos = new BigNumber(json.totalMiningFarmRoyaltiesInAcudos ?? entity.totalMiningFarmRoyaltiesInAcudos);
        entity.totalNftSold = parseInt(json.totalNftSold ?? entity.totalNftSold);
        entity.maintenanceFeeDepositedInBtc = new BigNumber(json.maintenanceFeeDepositedInBtc ?? entity.maintenanceFeeDepositedInBtc);
        entity.earningsPerDayInAcudos = (json.earningsPerDayInAcudos ?? entity.earningsPerDayInAcudos).map((j) => new BigNumber(j));

        return entity;
    }

}
