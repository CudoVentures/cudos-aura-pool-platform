import { makeAutoObservable } from 'mobx';
import S from '../../../core/utilities/Main';

export enum NftHashPowerFilter {
    NONE = 1,
    BELOW_1000_EH = 2,
    BELOW_2000_EH = 3,
    ABOVE_2000_EH = 4,
}

export enum NftPriceSortDirection {
    NONE = 1,
    LOW_TO_HIGH = 2,
    HIGH_TO_LOW = 3,
}

export default class NftFilterModel {

    static SORT_KEY_NAME = 1;
    static SORT_KEY_POPULAR = 2;

    sessionAccount: number;
    categoryIds: string[];
    hashPowerFilter: NftHashPowerFilter;
    sortPriceDirection: NftPriceSortDirection;
    sortKey: number;
    searchString: string;
    collectionIds: string[];
    from: number;
    count: number;

    constructor() {
        this.sessionAccount = S.INT_FALSE;
        this.sortKey = NftFilterModel.SORT_KEY_NAME;
        this.hashPowerFilter = NftHashPowerFilter.NONE;
        this.sortPriceDirection = NftPriceSortDirection.NONE;
        this.searchString = '';
        this.collectionIds = [];
        this.categoryIds = [];
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;

        makeAutoObservable(this);
    }

    static toJson(entity: NftFilterModel) {
        if (entity === null) {
            return null;
        }

        return {
            sessionAccount: entity.sessionAccount,
            sortKey: entity.sortKey,
            hashPowerFilter: entity.hashPowerFilter,
            sortPriceDirection: entity.sortPriceDirection,
            searchString: entity.searchString,
            categoryIds: entity.categoryIds,
            collectionIds: entity.collectionIds,
            from: entity.from,
            count: entity.count,
        }
    }

    static fromJson(json): NftFilterModel {
        if (json === null) {
            return null;
        }

        const model = new NftFilterModel();

        model.sessionAccount = parseInt(json.sessionAccount ?? model.sessionAccount);
        model.sortKey = parseInt(json.sortKey ?? model.sortKey);
        model.hashPowerFilter = parseInt(json.hashPowerFilter ?? model.hashPowerFilter);
        model.sortPriceDirection = parseInt(json.sortPriceDirection ?? model.sortPriceDirection);
        model.searchString = json.searchString ?? model.searchString;
        model.categoryIds = (json.categoryIds ?? model.categoryIds).map((j) => j.toString());
        model.collectionIds = (json.collectionIds ?? model.collectionIds).map((j) => j.toString());
        model.from = parseInt(json.from ?? model.from);
        model.count = parseInt(json.count ?? model.count);

        return model;
    }

}
