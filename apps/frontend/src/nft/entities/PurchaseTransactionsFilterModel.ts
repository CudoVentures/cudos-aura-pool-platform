import { makeAutoObservable } from 'mobx';

export default class PurchaseTransactionsFilterModel {

    from: number;
    count: number;

    constructor() {
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;

        makeAutoObservable(this);
    }

    static toJson(model: PurchaseTransactionsFilterModel) {
        if (model === null) {
            return null;
        }

        return {
            'from': model.from,
            'count': model.count,
        }
    }

}
