import BigNumber from 'bignumber.js';
import { CURRENCY_DECIMALS } from 'cudosjs';
import { makeAutoObservable } from 'mobx';
import { CHAIN_DETAILS } from '../../core/utilities/Constants';

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
            'cudosEarningsPerDay': entity.cudosEarningsPerDay.map((e) => e.toString()),
            'btcEarningsPerDay': entity.btcEarningsPerDay.map((e) => e.toString()),
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
