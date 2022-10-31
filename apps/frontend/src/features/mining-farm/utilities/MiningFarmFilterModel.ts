import S from '../../../core/utilities/Main';
import { MiningFarmStatus } from '../entities/MiningFarmEntity';

export enum MiningFarmHashPowerFilter {
    NONE = 1,
    BELOW_1000_EH = 2,
    BELOW_2000_EH = 3,
    ABOVE_2000_EH = 4,
}

export enum MiningFarmPriceSortDirection {
    NONE = 1,
    LOW_TO_HIGH = 2,
    HIGH_TO_LOW = 3,
}

export default class MiningFarmFilterModel {

    static SORT_KEY_NAME = 1;
    static SORT_KEY_POPULAR = 2;

    miningFarmIds: string[];
    status: MiningFarmStatus;
    searchString: string;
    sessionAccount: number;
    hashPowerFilter: MiningFarmHashPowerFilter;
    sortPriceDirection: MiningFarmPriceSortDirection;
    sortKey: number;
    from: number;
    count: number;

    constructor() {
        this.miningFarmIds = null;
        this.sortKey = MiningFarmFilterModel.SORT_KEY_NAME;
        this.hashPowerFilter = MiningFarmHashPowerFilter.NONE;
        this.sortPriceDirection = MiningFarmPriceSortDirection.NONE;
        this.searchString = '';
        this.status = MiningFarmStatus.APPROVED;
        this.sessionAccount = S.INT_FALSE;
        this.from = 0;
        this.count = Number.MAX_SAFE_INTEGER;
    }

    static toJson(entity: MiningFarmFilterModel) {
        if (entity === null) {
            return null;
        }

        return {
            miningFarmIds: entity.miningFarmIds,
            sortKey: entity.sortKey,
            hashPowerFilter: entity.hashPowerFilter,
            sortPriceDirection: entity.sortPriceDirection,
            searchString: entity.searchString,
            status: entity.status,
            sessionAccount: entity.sessionAccount,
            from: entity.from,
            count: entity.count,
        }
    }

    static fromJson(json): MiningFarmFilterModel {
        if (json === null) {
            return null;
        }

        const model = new MiningFarmFilterModel();

        model.miningFarmIds = json.miningFarmIds ?? model.miningFarmIds;
        model.sortKey = parseInt(json.sortKey ?? model.sortKey);
        model.hashPowerFilter = parseInt(json.hashPowerFilter ?? model.hashPowerFilter);
        model.sortPriceDirection = parseInt(json.sortPriceDirection ?? model.sortPriceDirection);
        model.searchString = json.searchString ?? model.searchString;
        model.status = json.status ?? model.status;
        model.sessionAccount = parseInt(json.sessionAccount ?? model.sessionAccount);
        model.from = parseInt(json.from ?? model.from);
        model.count = parseInt(json.count ?? model.count);

        return model;
    }

}
