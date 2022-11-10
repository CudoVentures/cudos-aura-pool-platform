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
            'ids': entity.miningFarmIds.join(','),
            'status': entity.status,
            'searchString': entity.searchString,
            'creator_id': entity.sessionAccount,
            'offset': entity.from,
            'limit': entity.count,
        }
    }
}
