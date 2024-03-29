import BigNumber from 'bignumber.js';

export default class NftEarningsEntity {

    earningsPerDayInBtc: BigNumber[];

    constructor() {
        this.earningsPerDayInBtc = [];
    }

    static toJson(entity: NftEarningsEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'earningsPerDayInBtc': entity.earningsPerDayInBtc.map((n) => n.toString(10)),
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
