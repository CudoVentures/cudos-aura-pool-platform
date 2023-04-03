import { PurchaseTransactionsFilterJsonValidation } from '../nft.types';

export default class PurchaseTransactionsFilterEntity {

    from: number;
    count: number;

    constructor() {
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;
    }

    static fromJson(json: PurchaseTransactionsFilterJsonValidation) {
        if (json === null) {
            return null;
        }

        const entity = new PurchaseTransactionsFilterEntity();

        entity.from = json.from || entity.from;
        entity.count = json.count || entity.count;

        return entity;
    }

}
