import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';

export default class TotalEarningsEntity {

    totalSalesInAcudos: BigNumber;
    earningsPerDayInUsd: number[];

    constructor() {
        this.totalSalesInAcudos = new BigNumber(0);
        this.earningsPerDayInUsd = [];

        makeAutoObservable(this);
    }

    static toJson(entity: TotalEarningsEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'totalSalesInAcudos': entity.totalSalesInAcudos.toString(),
            'earningsPerDayInUsd': entity.earningsPerDayInUsd,
        }
    }

    static fromJson(json: any): TotalEarningsEntity {
        if (json === null) {
            return null;
        }

        const entity = new TotalEarningsEntity();

        entity.totalSalesInAcudos = new BigNumber(json.totalSalesInAcudos ?? entity.totalSalesInAcudos);
        entity.earningsPerDayInUsd = (json.earningsPerDayInUsd ?? entity.earningsPerDayInUsd).map((j) => parseInt(j));

        return entity;
    }

}
