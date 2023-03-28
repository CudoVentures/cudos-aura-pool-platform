export default class BitcoinDataEntity {

    priceInUsd: number;
    priceChangeInUsd: number;

    constructor(priceInUsd: number, priceChangeInUsd: number) {
        this.priceInUsd = priceInUsd;
        this.priceChangeInUsd = priceChangeInUsd;
    }

    static toJson(entity: BitcoinDataEntity): any {
        if (entity === null) {
            return null;
        }

        return {
            'priceInUsd': entity.priceInUsd,
            'priceChangeInUsd': entity.priceChangeInUsd,
        }
    }

}
