import BigNumber from 'bignumber.js';

export default class EarningsEntity {
    cudosEarningsPerDay: BigNumber[];
    btcEarningsPerDay: BigNumber[];

    constructor() {
        this.cudosEarningsPerDay = [];
        this.btcEarningsPerDay = [];
    }

    static toJson(entity: EarningsEntity) {
        if (entity === null) {
            return null;
        }
        return {
            'cudosEarningsPerDay': entity.cudosEarningsPerDay.map((m) => m.toString()),
            'btcEarningsPerDay': entity.btcEarningsPerDay.map((m) => m.toString()),
        }
    }

    static fromJson(json: any): EarningsEntity {
        if (json === null) {
            return null;
        }
        const entity = new EarningsEntity();

        entity.cudosEarningsPerDay = (json.cudosEarningsPerDay ?? entity.cudosEarningsPerDay).map((j) => new BigNumber(j));
        entity.btcEarningsPerDay = (json.btcEarningsPerDay ?? entity.btcEarningsPerDay).map((j) => new BigNumber(j));

        return entity;
    }
}
