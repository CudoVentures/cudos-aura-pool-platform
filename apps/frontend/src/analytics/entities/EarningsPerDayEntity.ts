import BigNumber from 'bignumber.js';
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
            'cudosEarningsPerDay': entity.cudosEarningsPerDay.map((e) => e.toString()),
            'btcEarningsPerDay': entity.btcEarningsPerDay.map((e) => e.toString()),
        }
    }

    static fromJson(json: any): EarningsPerDayEntity {
        if (json === null) {
            return null;
        }

        const entity = new EarningsPerDayEntity();

        entity.cudosEarningsPerDay = (json.cudosEarningsPerDay ?? entity.cudosEarningsPerDay).map((j) => new BigNumber(j));
        entity.btcEarningsPerDay = (json.btcEarningsPerDay ?? entity.btcEarningsPerDay).map((j) => new BigNumber(j));

        return entity;
    }

}
