import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';
import { CollectionStatus } from '../entities/CollectionEntity';

export enum CollectionHashPowerFilter {
    NONE = 1,
    BELOW_1000_EH = 2,
    BELOW_2000_EH = 3,
    ABOVE_2000_EH = 4,
}

export default class CollectionFilterModel {

    static SORT_KEY_NAME = 1;
    static SORT_KEY_PRICE = 2;

    sessionAccount: number;
    farmId: string;
    sortKey: number;
    hashPowerFilter: CollectionHashPowerFilter;
    searchString: string;
    categoryIds: string[];
    from: number;
    count: number;
    status: CollectionStatus;

    constructor() {
        this.sessionAccount = S.INT_FALSE;
        this.farmId = '';
        this.hashPowerFilter = CollectionHashPowerFilter.NONE;
        this.sortKey = CollectionFilterModel.SORT_KEY_NAME;
        this.searchString = '';
        this.categoryIds = [];
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;
        this.status = CollectionStatus.APPROVED;

        makeAutoObservable(this);
    }

    markSessionAccount() {
        this.sessionAccount = S.INT_TRUE;
    }

    static toJson(model) {
        if (model === null) {
            return null;
        }

        return {
            sessionAccount: model.sessionAccount,
            farmId: model.farmId,
            sortKey: model.sortKey,
            hashPowerFilter: model.hashPowerFilter,
            searchString: model.searchString,
            categoryIds: model.categoryIds,
            from: model.from,
            count: model.count,
            status: model.status,
        }
    }

    static fromJson(json): CollectionFilterModel {
        if (json === null) {
            return null;
        }

        const model = new CollectionFilterModel();

        model.sessionAccount = parseInt(json.sessionAccount ?? model.sessionAccount);
        model.farmId = (json.farmId ?? model.farmId).toString();
        model.sortKey = parseInt(json.sortKey ?? model.sortKey);
        model.hashPowerFilter = parseInt(json.hashPowerFilter ?? model.hashPowerFilter);
        model.searchString = json.searchString ?? model.searchString;
        model.categoryIds = (json.categoryIds ?? model.categoryIds).map((j) => j.toString());
        model.from = parseInt(json.from ?? model.from);
        model.count = parseInt(json.count ?? model.count);
        model.status = json.status ?? model.status;

        return model;
    }

}
