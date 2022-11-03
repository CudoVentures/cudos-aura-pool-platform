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

    collectionIds: string[];
    status: CollectionStatus;
    searchString: string;
    // sessionAccount: number;
    farmId: string;
    sortKey: number;
    hashPowerFilter: CollectionHashPowerFilter;
    from: number;
    count: number;

    constructor() {
        this.collectionIds = null;
        this.status = CollectionStatus.APPROVED;
        this.searchString = '';
        // this.sessionAccount = S.INT_FALSE;
        this.farmId = S.Strings.NOT_EXISTS;
        this.sortKey = CollectionFilterModel.SORT_KEY_NAME;
        this.hashPowerFilter = CollectionHashPowerFilter.NONE;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;

        makeAutoObservable(this);
    }

    // markSessionAccount() {
    //     this.sessionAccount = S.INT_TRUE;
    // }

    markAnyCollectins() {
        this.status = CollectionStatus.ANY;
    }

    static toJson(model) {
        if (model === null) {
            return null;
        }

        return {
            collectionIds: model.collectionIds,
            status: model.status,
            searchString: model.searchString,
            // sessionAccount: model.sessionAccount,
            farmId: model.farmId,
            sortKey: model.sortKey,
            hashPowerFilter: model.hashPowerFilter,
            from: model.from,
            count: model.count,
        }
    }

    static fromJson(json): CollectionFilterModel {
        if (json === null) {
            return null;
        }

        const model = new CollectionFilterModel();

        model.collectionIds = json.collectionIds ?? model.collectionIds;
        model.status = json.status ?? model.status;
        model.searchString = json.searchString ?? model.searchString;
        // model.sessionAccount = parseInt(json.sessionAccount ?? model.sessionAccount);
        model.farmId = (json.farmId ?? model.farmId).toString();
        model.sortKey = parseInt(json.sortKey ?? model.sortKey);
        model.hashPowerFilter = parseInt(json.hashPowerFilter ?? model.hashPowerFilter);
        model.from = parseInt(json.from ?? model.from);
        model.count = parseInt(json.count ?? model.count);

        return model;
    }

}
