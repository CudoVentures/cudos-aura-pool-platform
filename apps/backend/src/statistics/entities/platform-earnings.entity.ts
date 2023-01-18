import BigNumber from 'bignumber.js';

export default class EarningsEntity {
    acudosEarningsPerDay: BigNumber[];
    btcEarningsPerDay: BigNumber[];

    constructor() {
        this.acudosEarningsPerDay = [];
        this.btcEarningsPerDay = [];
    }

    static toJson(entity: EarningsEntity) {
        if (entity === null) {
            return null;
        }
        return {
            'acudosEarningsPerDay': entity.acudosEarningsPerDay.map((m) => m.toString()),
            'btcEarningsPerDay': entity.btcEarningsPerDay.map((m) => m.toString()),
        }
    }

    static fromJson(json: any): EarningsEntity {
        if (json === null) {
            return null;
        }
        const entity = new EarningsEntity();

        entity.acudosEarningsPerDay = (json.acudosEarningsPerDay ?? entity.acudosEarningsPerDay).map((j) => new BigNumber(j));
        entity.btcEarningsPerDay = (json.btcEarningsPerDay ?? entity.btcEarningsPerDay).map((j) => new BigNumber(j));

        return entity;
    }
}
