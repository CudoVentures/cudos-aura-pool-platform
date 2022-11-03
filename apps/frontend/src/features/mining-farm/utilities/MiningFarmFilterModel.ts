import S from '../../../core/utilities/Main';
import { MiningFarmStatus } from '../entities/MiningFarmEntity';

export default class MiningFarmFilterModel {

    static SORT_KEY_NAME = 1;
    static SORT_KEY_POPULAR = 2;

    miningFarmIds: string[];
    status: MiningFarmStatus;
    searchString: string;
    sessionAccount: number;
    from: number;
    count: number;

    constructor() {
        this.miningFarmIds = null;
        this.status = MiningFarmStatus.APPROVED;
        this.searchString = '';
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
            status: entity.status,
            searchString: entity.searchString,
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
        model.status = json.status ?? model.status;
        model.searchString = json.searchString ?? model.searchString;
        model.sessionAccount = parseInt(json.sessionAccount ?? model.sessionAccount);
        model.from = parseInt(json.from ?? model.from);
        model.count = parseInt(json.count ?? model.count);

        return model;
    }

}
