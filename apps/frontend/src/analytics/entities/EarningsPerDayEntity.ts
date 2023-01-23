import BigNumber from 'bignumber.js';
import { CURRENCY_DECIMALS } from 'cudosjs';
import { makeAutoObservable } from 'mobx';

export default class EarningsPerDayEntity {

    cudosEarningsPerDay: BigNumber[];
    btcEarningsPerDay: BigNumber[];

    constructor() {
        this.cudosEarningsPerDay = [];
        this.btcEarningsPerDay = [];

        makeAutoObservable(this);
    }

    static toJson(entity: EarningsPerDayEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'cudosEarningsPerDay': entity.cudosEarningsPerDay.map((e) => e.toString(10)),
            'btcEarningsPerDay': entity.btcEarningsPerDay.map((e) => e.toString(10)),
        }
    }

    static fromJson(json: any): EarningsPerDayEntity {
        if (json === null) {
            return null;
        }

        const entity = new EarningsPerDayEntity();

        entity.cudosEarningsPerDay = json.acudosEarningsPerDay
            ? json.acudosEarningsPerDay.map((j) => (new BigNumber(j).shiftedBy(-CURRENCY_DECIMALS)))
            : entity.btcEarningsPerDay;
        entity.btcEarningsPerDay = (json.btcEarningsPerDay ?? entity.btcEarningsPerDay).map((j) => new BigNumber(j));

        return entity;
    }

}
