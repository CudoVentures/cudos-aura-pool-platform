import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';

export default class NftEarningsEntity {

    earningsPerDayInBtc: BigNumber[];

    constructor() {
        this.earningsPerDayInBtc = [];

        makeAutoObservable(this);
    }

    static toJson(entity: NftEarningsEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'earningsPerDayInBtc': entity.earningsPerDayInBtc.map((n) => n.toString()),
        }
    }

    static fromJson(json: any): NftEarningsEntity {
        if (json === null) {
            return null;
        }

        const entity = new NftEarningsEntity();

        entity.earningsPerDayInBtc = (json.earningsPerDayInBtc ?? entity.earningsPerDayInBtc).map((n) => new BigNumber(n));

        return entity;
    }

}
