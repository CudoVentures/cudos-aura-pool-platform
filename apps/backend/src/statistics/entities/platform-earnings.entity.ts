import BigNumber from 'bignumber.js';

export default class EarningsPerDayEntity {
    acudosEarningsPerDay: BigNumber[];
    btcEarningsPerDay: BigNumber[];

    constructor() {
        this.acudosEarningsPerDay = [];
        this.btcEarningsPerDay = [];
    }

    static toJson(entity: EarningsPerDayEntity) {
        if (entity === null) {
            return null;
        }
        return {
            'acudosEarningsPerDay': entity.acudosEarningsPerDay.map((m) => m.toString()),
            'btcEarningsPerDay': entity.btcEarningsPerDay.map((m) => m.toString()),
        }
    }

    static fromJson(json: any): EarningsPerDayEntity {
        if (json === null) {
            return null;
        }
        const entity = new EarningsPerDayEntity();

        entity.acudosEarningsPerDay = (json.acudosEarningsPerDay ?? entity.acudosEarningsPerDay).map((j) => new BigNumber(j));
        entity.btcEarningsPerDay = (json.btcEarningsPerDay ?? entity.btcEarningsPerDay).map((j) => new BigNumber(j));

        return entity;
    }
}
